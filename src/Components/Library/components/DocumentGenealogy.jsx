// =================================================================================
// DOCUMENT GENEALOGY - React Flow Version
// =================================================================================
import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
  ReactFlowProvider,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Info, FileText, User, Calendar, ExternalLink } from 'lucide-react';
import { documentsService } from '../../../services/documentsService';
import DocumentViewer from './DocumentViewer';

// Layout configuration
const NODE_WIDTH = 280;
const NODE_HEIGHT = 120;
const VERTICAL_SPACING = 150;
const HORIZONTAL_SPACING = 50;

// Custom node component
const DocumentNode = ({ data }) => {
  const isRoot = data.isRoot;
  const isSelected = data.isSelected;
  
  return (
    <>
      {/* Handle en haut pour les connexions entrantes */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{
          width: 12,
          height: 12,
          background: '#3B82F6',
          border: '2px solid white',
        }}
      />
      
      <div 
        className={`px-4 py-3 rounded-lg shadow-lg border-2 transition-all cursor-pointer
          ${isRoot ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-300'}
          ${isSelected ? 'ring-4 ring-blue-300' : ''}
          hover:shadow-xl hover:scale-105`}
        style={{ width: NODE_WIDTH, minHeight: NODE_HEIGHT }}
      >
        <div className="flex items-start gap-2 mb-2">
          <FileText className={`w-5 h-5 flex-shrink-0 ${isRoot ? 'text-blue-600' : 'text-gray-600'}`} />
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
            {data.title}
          </h3>
        </div>
        
        <div className="space-y-1 text-xs text-gray-600">
          {data.author && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className="truncate">{data.author}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">
              Token #{data.tokenId}
            </span>
            {data.citationsCount > 0 && (
              <span className="text-xs text-gray-500">
                {data.citationsCount} ref{data.citationsCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Handle en bas pour les connexions sortantes */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{
          width: 12,
          height: 12,
          background: '#3B82F6',
          border: '2px solid white',
        }}
      />
    </>
  );
};

const nodeTypes = {
  documentNode: DocumentNode,
};

// =================================================================================
// MAIN COMPONENT
// =================================================================================
const DocumentGenealogy = ({ tokenId }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Build genealogy tree from Firestore
  const buildGenealogyTree = async (id, depth = 0, processedIds = new Set()) => {
    if (!id || processedIds.has(id)) return null;

    try {
      const docData = await documentsService.getDocumentByTokenId(id.toString());
      if (!docData) return null;

      processedIds.add(id);
      const references = docData.references 
        ? docData.references.split(',').map(ref => ref.trim()).filter(Boolean) 
        : [];
      
      const childrenData = await Promise.all(
        references.map(refId => 
          refId ? buildGenealogyTree(refId, depth + 1, new Set([...processedIds])) : null
        )
      );

      return {
        id,
        title: docData.title || `Document #${id}`,
        description: docData.description,
        author: docData.authors || docData.author,
        createdAt: docData.createdAt,
        ipfsCid: docData.ipfsCid,
        citations: references,
        children: childrenData.filter(Boolean)
      };
    } catch (error) {
      console.error('Error building genealogy tree:', error);
      return null;
    }
  };

  // Transform tree to React Flow format with hierarchical layout
  const transformToReactFlow = (treeData, rootTokenId) => {
    if (!treeData) return { nodes: [], edges: [] };

    const nodes = [];
    const edges = [];
    
    // Calculate positions using hierarchical layout
    const calculateLayout = (node, depth = 0, position = 0, siblings = 1) => {
      const nodeId = `node-${node.id}`;
      const x = position * (NODE_WIDTH + HORIZONTAL_SPACING);
      const y = depth * (NODE_HEIGHT + VERTICAL_SPACING);

      nodes.push({
        id: nodeId,
        type: 'documentNode',
        position: { x, y },
        data: {
          tokenId: node.id,
          title: node.title,
          author: node.author,
          description: node.description,
          ipfsCid: node.ipfsCid,
          citations: node.citations,
          citationsCount: node.children?.length || 0,
          isRoot: node.id === rootTokenId,
          isSelected: false,
        },
      });

      if (node.children && node.children.length > 0) {
        const childrenWidth = node.children.length;
        const startPos = position - (childrenWidth - 1) / 2;

        node.children.forEach((child, index) => {
          const childNodeId = `node-${child.id}`;
          
          // Les flèches vont de la référence (child) vers le document principal (parent)
          edges.push({
            id: `edge-${childNodeId}-${nodeId}`,
            source: childNodeId,
            target: nodeId,
            sourceHandle: 'bottom',
            targetHandle: 'top',
            type: 'smoothstep',
            animated: true,
            style: { 
              stroke: '#3B82F6', 
              strokeWidth: 3,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: '#3B82F6',
            },
          });

          calculateLayout(child, depth + 1, startPos + index, childrenWidth);
        });
      }
    };

    calculateLayout(treeData);
    
    return { nodes, edges };
  };

  // Fetch and build genealogy
  useEffect(() => {
    const fetchGenealogy = async (id) => {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const genealogyData = await buildGenealogyTree(id);
        if (genealogyData) {
          const { nodes: flowNodes, edges: flowEdges } = transformToReactFlow(genealogyData, id);
          setNodes(flowNodes);
          setEdges(flowEdges);
        } else {
          setError('Aucune donnée de généalogie trouvée');
        }
      } catch (error) {
        console.error("Error in fetchGenealogy:", error);
        setError('Erreur lors du chargement: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    if (tokenId) {
      fetchGenealogy(tokenId);
    } else {
      const hash = window.location.hash.slice(1);
      const parts = hash.split('?');
      if (parts[0] === 'genealogy' && parts.length > 1) {
        const urlParams = new URLSearchParams(parts[1]);
        const urlTokenId = urlParams.get('tokenId');
        if (urlTokenId) {
          fetchGenealogy(urlTokenId);
        } else {
          setError('Token ID non fourni');
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
  }, [tokenId]);

  // Handle node click
  const onNodeClick = useCallback(async (event, node) => {
    try {
      const docData = await documentsService.getDocumentByTokenId(node.data.tokenId);
      if (docData) {
        setSelectedNode({
          name: docData.title,
          attributes: {
            tokenId: node.data.tokenId,
            author: docData.authors || docData.author,
            description: docData.description,
            citations: docData.references 
              ? docData.references.split(',').map(ref => ref.trim()).filter(Boolean) 
              : [],
            ipfsCid: docData.ipfsCid
          }
        });

        // Update node selection state
        setNodes(nds =>
          nds.map(n => ({
            ...n,
            data: { ...n.data, isSelected: n.id === node.id }
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching document details:', error);
    }
  }, [setNodes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de l'arbre de citations...</p>
        </div>
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

  return (
    <ReactFlowProvider>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
        {/* React Flow Visualization */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden" style={{ height: '600px' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{
              padding: 0.2,
            }}
            minZoom={0.1}
            maxZoom={1.5}
            defaultEdgeOptions={{
              type: 'default',
              animated: true,
              style: { strokeWidth: 2, stroke: '#6B7280' },
            }}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#E5E7EB" gap={16} size={1} />
            <Controls showInteractive={false} />
            <MiniMap 
              nodeColor={(node) => node.data.isRoot ? '#3B82F6' : '#D1D5DB'}
              maskColor="rgba(0, 0, 0, 0.1)"
              nodeStrokeWidth={3}
              zoomable
              pannable
            />
            <Panel position="top-left" className="bg-white/90 backdrop-blur-sm p-2 rounded shadow text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded" />
                  <span>Document principal</span>
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <div className="w-3 h-3 bg-gray-300 rounded" />
                  <span>Références</span>
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>

      {/* Document Details Panel */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow h-full overflow-auto">
          <div className="border-b border-gray-200 p-4 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Détails du document</h2>
          </div>
          <div className="p-4">
            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{selectedNode.name}</h3>
                  <p className="text-sm text-gray-600">Token #{selectedNode.attributes.tokenId}</p>
                </div>
                
                {selectedNode.attributes.author && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-1 flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Auteur
                    </h4>
                    <p className="text-sm text-gray-800">{selectedNode.attributes.author}</p>
                  </div>
                )}
                
                {selectedNode.attributes.description && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-1">Description</h4>
                    <p className="text-sm text-gray-800">{selectedNode.attributes.description}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Citations</h4>
                  {selectedNode.attributes.citations?.length > 0 ? (
                    <ul className="space-y-1">
                      {selectedNode.attributes.citations.map((citation, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          Référence #{citation}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Aucune citation</p>
                  )}
                </div>
                
                {selectedNode.attributes.ipfsCid && (
                  <div className="border-t pt-4">
                    <DocumentViewer documentCid={selectedNode.attributes.ipfsCid} />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  Cliquez sur un document pour voir les détails
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </ReactFlowProvider>
  );
};

export default DocumentGenealogy;
