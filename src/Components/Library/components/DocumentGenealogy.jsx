// =================================================================================
// 1. IMPORTS & DEPENDENCIES
// =================================================================================
import React, { useState, useEffect } from 'react';
import { useContractRead } from 'wagmi';
import Tree from 'react-d3-tree';
import { Info } from 'lucide-react';
import { contractConfig } from '../../../config/wagmiConfig';
import { documentsService } from '../../../services/documentsService';
import { I4TKTokenAddress, I4TKTokenABI } from '../../../constants';
import DocumentViewer from './DocumentViewer';

// =================================================================================
// 2. MAIN COMPONENT
// =================================================================================
const DocumentGenealogy = ({ tokenId }) => {
  // -----------------------------------------------------------------------------
  // 2.1 State Management
  // -----------------------------------------------------------------------------
  const [treeData, setTreeData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // -----------------------------------------------------------------------------
  // 2.2 Contract Reads
  // -----------------------------------------------------------------------------
  const { data: tokenURI } = useContractRead({
    ...contractConfig,
    abi: I4TKTokenABI,
    functionName: 'uri',
    args: [tokenId ? BigInt(tokenId) : null], // Ajout de la vérification ici
    enabled: !!tokenId,
  });

  // -----------------------------------------------------------------------------
  // 2.3 Data Transformation
  // -----------------------------------------------------------------------------
  const transformToD3Tree = (genealogyData) => {
    if (!genealogyData) return null;

    const node = {
      name: genealogyData.title,
      attributes: {
        tokenId: genealogyData.id,
        author: genealogyData.author,
        description: genealogyData.description,
        citations: genealogyData.citations
      }
    };

    if (genealogyData.children && genealogyData.children.length > 0) {
      node.children = genealogyData.children.map(transformToD3Tree).filter(Boolean);
    }

    return node;
  };

  // -----------------------------------------------------------------------------
  // 2.4 Data Fetching
  // -----------------------------------------------------------------------------
  const buildGenealogyTree = async (id, depth = 0, processedIds = new Set()) => {
    if (!id || processedIds.has(id)) return null; // Vérification supplémentaire pour id

    try {
      const docData = await documentsService.getDocumentByTokenId(id.toString());
      if (!docData) return null;

      processedIds.add(id);
      const references = docData.references ? docData.references.split(',').map(ref => ref.trim()).filter(Boolean) : []; // Filtrage des références vides
      const childrenData = await Promise.all(
        references.map(refId => refId ? buildGenealogyTree(refId, depth + 1, new Set([...processedIds])) : null) // Vérification pour refId
      );

      return {
        id,
        title: docData.title || `Document #${id}`,
        description: docData.description,
        author: docData.authors || docData.author,
        createdAt: docData.createdAt,
        citations: references,
        children: childrenData.filter(Boolean)
      };
    } catch (error) {
      console.error('Error building genealogy tree:', error);
      return null;
    }
  };

  // -----------------------------------------------------------------------------
  // 2.5 Effects
  // -----------------------------------------------------------------------------
  // Fonction fetchGenealogy extraite pour être réutilisable
  const fetchGenealogy = async (id) => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching genealogy for tokenId:", id);
      const genealogyData = await buildGenealogyTree(id);
      const d3TreeData = transformToD3Tree(genealogyData);
      setTreeData(d3TreeData);
    } catch (error) {
      console.error("Error in fetchGenealogy:", error);
      setError('Error fetching genealogy: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Effet pour extraire le tokenId de l'URL si nécessaire
  useEffect(() => {
    // Si tokenId est null, essayer de l'extraire de l'URL
    if (!tokenId) {
      const hash = window.location.hash.slice(1);
      const parts = hash.split('?');
      if (parts[0] === 'genealogy' && parts.length > 1) {
        const urlParams = new URLSearchParams(parts[1]);
        const urlTokenId = urlParams.get('tokenId');

        if (urlTokenId) {
          console.log("Found tokenId in URL:", urlTokenId);
          fetchGenealogy(urlTokenId);
        } else {
          console.log("No tokenId found in URL parameters");
          setError('Token ID non fourni');
        }
      }
    }
  }, []);

  // Effet qui s'exécute lorsque tokenId change via les props
  useEffect(() => {
    if (tokenId) {
      console.log("TokenId provided via props:", tokenId);
      fetchGenealogy(tokenId);
    }
  }, [tokenId]);

  // -----------------------------------------------------------------------------
  // 2.6 Event Handlers
  // -----------------------------------------------------------------------------
  const handleNodeClick = async (nodeData) => {
    try {
      setLoading(true);
      const tokenId = nodeData.attributes.tokenId;
      if (!tokenId) {
        console.warn('No token ID found for node');
        return;
      }

      const docData = await documentsService.getDocumentByTokenId(tokenId);

      if (docData) {
        setSelectedNode({
          name: docData.title,
          attributes: {
            tokenId: tokenId,
            author: docData.authors || docData.author,
            description: docData.description,
            citations: docData.references ? docData.references.split(',').map(ref => ref.trim()).filter(Boolean) : [], // Filtrage des références vides
            ipfsCid: docData.ipfsCid
          }
        });
      }
    } catch (error) {
      console.error('Error fetching document details:', error);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------------------------------
  // 2.7 Render Helpers
  // -----------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        <p className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          {error}
        </p>
      </div>
    );
  }

  // -----------------------------------------------------------------------------
  // 2.8 Main Render
  // -----------------------------------------------------------------------------
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-white rounded-lg shadow">
        <div style={{ width: '100%', height: '600px' }}>
          {treeData && (
            <Tree
              data={treeData}
              orientation="vertical"
              pathFunc="elbow"
              translate={{ x: 150, y: 50 }}
              nodeSize={{ x: 200, y: 80 }}
              separation={{ siblings: 0.8, nonSiblings: 1.2 }}
              onNodeClick={handleNodeClick}
              centeringTransitionDuration={200}
              renderCustomNodeElement={({ nodeDatum }) => (
                <g onClick={() => handleNodeClick(nodeDatum)}>
                  <circle 
                    r="15" 
                    fill={nodeDatum.attributes.tokenId === tokenId ? "#3B82F6" : "#9CA3AF"}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  <foreignObject 
                    x="20" 
                    y="-12" 
                    width="160" 
                    height="24"
                  >
                    <div className="text-sm font-medium text-gray-800 bg-white/80 px-2 py-1 rounded shadow-sm backdrop-blur-sm truncate">
                      {nodeDatum.name}
                    </div>
                  </foreignObject>
                </g>
              )}
            />
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-xl font-medium">Document details</h2>
          </div>
          <div className="p-4">
            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg">{selectedNode.name}</h3>
                  <p className="text-sm text-gray-600">Token #{selectedNode.attributes.tokenId}</p>
                </div>
                {selectedNode.attributes.author && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700">Author</h4>
                    <p className="text-sm">{selectedNode.attributes.author}</p>
                  </div>
                )}
                {selectedNode.attributes.description && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700">Description</h4>
                    <p className="text-sm">{selectedNode.attributes.description}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-sm text-gray-700">Citations</h4>
                  {selectedNode.attributes.citations?.length > 0 ? (
                    <ul className="list-disc pl-4 text-sm">
                      {selectedNode.attributes.citations.map((citation, index) => (
                        <li key={index}>Référence #{citation}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No citation</p>
                  )}
                </div>
                {selectedNode.attributes.ipfsCid && (
                  <DocumentViewer documentCid={selectedNode.attributes.ipfsCid} />
                )}
              </div>
            ) : (
              <p className="text-gray-500">
                Select a document to check details
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentGenealogy;