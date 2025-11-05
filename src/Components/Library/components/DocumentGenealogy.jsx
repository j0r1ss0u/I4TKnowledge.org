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
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebase';

// Layout configuration - responsive
const getNodeDimensions = () => {
  if (typeof window !== 'undefined') {
    const isMobile = window.innerWidth < 768;
    return {
      width: isMobile ? 220 : 280,
      height: isMobile ? 100 : 120,
      verticalSpacing: isMobile ? 120 : 150,
      horizontalSpacing: isMobile ? 30 : 50,
    };
  }
  return {
    width: 280,
    height: 120,
    verticalSpacing: 150,
    horizontalSpacing: 50,
  };
};

const NODE_WIDTH = getNodeDimensions().width;
const NODE_HEIGHT = getNodeDimensions().height;
const VERTICAL_SPACING = getNodeDimensions().verticalSpacing;
const HORIZONTAL_SPACING = getNodeDimensions().horizontalSpacing;

// Custom node component
const DocumentNode = ({ data }) => {
  const isRoot = data.isRoot;
  const isDescendant = data.isDescendant;
  const isSelected = data.isSelected;
  
  // Choose background color based on node type
  let bgColor = 'bg-white border-gray-300'; // Default for references
  if (isRoot) {
    bgColor = 'bg-blue-50 border-blue-500';
  } else if (isDescendant) {
    bgColor = 'bg-green-50 border-green-500';
  }
  
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
          background: isDescendant ? '#10B981' : '#3B82F6',
          border: '2px solid white',
        }}
      />
      
      <div 
        className={`px-3 md:px-4 py-2 md:py-3 rounded-lg shadow-lg border-2 transition-all cursor-pointer
          ${bgColor}
          ${isSelected ? 'ring-2 md:ring-4 ring-blue-300' : ''}
          hover:shadow-xl hover:scale-105`}
        style={{ width: NODE_WIDTH, minHeight: NODE_HEIGHT }}
      >
        <div className="flex items-start gap-1.5 md:gap-2 mb-1.5 md:mb-2">
          <FileText className={`w-4 h-4 md:w-5 md:h-5 flex-shrink-0 ${isRoot ? 'text-blue-600' : isDescendant ? 'text-green-600' : 'text-gray-600'}`} />
          <h3 className="text-xs md:text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
            {data.title}
          </h3>
        </div>
        
        <div className="space-y-0.5 md:space-y-1 text-xs text-gray-600">
          {data.author && (
            <div className="flex items-center gap-1">
              <User className="w-2.5 h-2.5 md:w-3 md:h-3" />
              <span className="truncate text-[10px] md:text-xs">{data.author}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="px-1.5 md:px-2 py-0.5 bg-gray-100 rounded text-[10px] md:text-xs font-medium">
              #{data.tokenId}
            </span>
            {data.citationsCount > 0 && (
              <span className="text-[10px] md:text-xs text-gray-500">
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
          background: isDescendant ? '#10B981' : '#3B82F6',
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

  // Find documents that cite the given document (descendants)
  const findDescendants = async (tokenId) => {
    try {
      console.log('🔍 Finding descendants for tokenId:', tokenId);
      
      const documentsRef = collection(db, 'web3IP');
      const allDocsSnapshot = await getDocs(documentsRef);
      
      console.log('📚 Total documents to scan:', allDocsSnapshot.size);
      
      const descendants = [];
      allDocsSnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Handle both string and array references
        let references = [];
        if (data.references) {
          if (Array.isArray(data.references)) {
            references = data.references.filter(Boolean);
          } else if (typeof data.references === 'string') {
            references = data.references.split(',').map(ref => ref.trim()).filter(Boolean);
          }
        }
        
        console.log(`📄 Doc ${data.tokenId} (${data.title}) references:`, references);
        
        if (references.includes(tokenId.toString())) {
          console.log(`✅ Found descendant: ${data.title} (Token #${data.tokenId})`);
          descendants.push({
            id: data.tokenId,
            title: data.title || `Document #${data.tokenId}`,
            description: data.description,
            author: data.authors || data.author,
            createdAt: data.createdAt,
            ipfsCid: data.ipfsCid,
            isDescendant: true
          });
        }
      });
      
      console.log(`🎯 Total descendants found: ${descendants.length}`, descendants);
      return descendants;
    } catch (error) {
      console.error('❌ Error finding descendants:', error);
      return [];
    }
  };

  // Build genealogy tree from Firestore (references - documents cited by this one)
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
        children: childrenData.filter(Boolean),
        isDescendant: false
      };
    } catch (error) {
      console.error('Error building genealogy tree:', error);
      return null;
    }
  };

  // Transform tree to React Flow format with hierarchical layout
  const transformToReactFlow = (treeData, descendants, rootTokenId) => {
    if (!treeData) return { nodes: [], edges: [] };

    const nodes = [];
    const edges = [];
    
    // Calculate positions using hierarchical layout for references (below main doc)
    const calculateLayout = (node, depth = 0, position = 0, siblings = 1) => {
      const nodeId = `node-${node.id}`;
      const x = position * (NODE_WIDTH + HORIZONTAL_SPACING);
      // Start main document at y=0, references go down (positive y)
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
          isDescendant: node.isDescendant || false,
          isSelected: false,
        },
      });

      if (node.children && node.children.length > 0) {
        const childrenWidth = node.children.length;
        const startPos = position - (childrenWidth - 1) / 2;

        node.children.forEach((child, index) => {
          const childNodeId = `node-${child.id}`;
          
          edges.push({
            id: `edge-${nodeId}-${childNodeId}`,
            source: nodeId,
            target: childNodeId,
            sourceHandle: 'bottom',
            targetHandle: 'top',
            type: 'smoothstep',
            animated: true,
            style: { 
              stroke: '#3B82F6', 
              strokeWidth: 3,
            },
          });

          calculateLayout(child, depth + 1, startPos + index, childrenWidth);
        });
      }
    };

    // Layout the main tree (references going down)
    calculateLayout(treeData);
    
    // Add descendants (going up from main document)
    if (descendants && descendants.length > 0) {
      const mainNodeId = `node-${rootTokenId}`;
      const descendantsWidth = descendants.length;
      const startPos = -(descendantsWidth - 1) / 2;
      
      descendants.forEach((descendant, index) => {
        const descendantNodeId = `node-desc-${descendant.id}`;
        const x = startPos * (NODE_WIDTH + HORIZONTAL_SPACING) + index * (NODE_WIDTH + HORIZONTAL_SPACING);
        const y = -(NODE_HEIGHT + VERTICAL_SPACING); // Negative y to go up
        
        nodes.push({
          id: descendantNodeId,
          type: 'documentNode',
          position: { x, y },
          data: {
            tokenId: descendant.id,
            title: descendant.title,
            author: descendant.author,
            description: descendant.description,
            ipfsCid: descendant.ipfsCid,
            citations: [],
            citationsCount: 0,
            isRoot: false,
            isDescendant: true,
            isSelected: false,
          },
        });
        
        // Create edge from descendant to main document (green connection)
        edges.push({
          id: `edge-desc-${descendant.id}-${rootTokenId}`,
          source: descendantNodeId,
          target: mainNodeId,
          sourceHandle: 'bottom',
          targetHandle: 'top',
          type: 'smoothstep',
          animated: true,
          style: { 
            stroke: '#10B981', 
            strokeWidth: 3,
          },
        });
      });
    }
    
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
        // Fetch both references (descendants of this doc) and descendants (docs that cite this one)
        const [genealogyData, descendants] = await Promise.all([
          buildGenealogyTree(id),
          findDescendants(id)
        ]);
        
        if (genealogyData) {
          const { nodes: flowNodes, edges: flowEdges } = transformToReactFlow(genealogyData, descendants, id);
          setNodes(flowNodes);
          setEdges(flowEdges);
        } else {
          setError('No genealogy data found');
        }
      } catch (error) {
        console.error("Error in fetchGenealogy:", error);
        setError('Loading error: ' + error.message);
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
          setError('Token ID not provided');
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
          <p className="text-gray-600">Loading citation tree...</p>
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
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 h-full">
        {/* React Flow Visualization */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden h-[400px] md:h-[500px] lg:h-[600px]">
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
            <Controls showInteractive={false} className="md:block" />
            <MiniMap 
              nodeColor={(node) => node.data.isRoot ? '#3B82F6' : node.data.isDescendant ? '#10B981' : '#D1D5DB'}
              maskColor="rgba(0, 0, 0, 0.1)"
              nodeStrokeWidth={3}
              zoomable
              pannable
              className="hidden md:block"
            />
            <Panel position="top-left" className="bg-white/90 backdrop-blur-sm p-1.5 md:p-2 rounded shadow text-xs md:text-sm">
              <div className="flex flex-col md:flex-row md:flex-wrap items-start md:items-center gap-1.5 md:gap-3 text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded" />
                  <span className="text-xs md:text-sm">Descendants</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-blue-500 rounded" />
                  <span className="text-xs md:text-sm">Main Doc</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-gray-300 rounded" />
                  <span className="text-xs md:text-sm">References</span>
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>

      {/* Document Details Panel */}
      <div className="lg:col-span-1 max-h-[400px] lg:max-h-full">
        <div className="bg-white rounded-lg shadow h-full overflow-auto">
          <div className="border-b border-gray-200 p-3 md:p-4 bg-gray-50">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Document Details</h2>
          </div>
          <div className="p-3 md:p-4">
            {selectedNode ? (
              <div className="space-y-3 md:space-y-4">
                <div>
                  <h3 className="font-bold text-base md:text-lg text-gray-900 mb-1">{selectedNode.name}</h3>
                  <p className="text-xs md:text-sm text-gray-600">Token #{selectedNode.attributes.tokenId}</p>
                </div>
                
                {selectedNode.attributes.author && (
                  <div>
                    <h4 className="font-semibold text-xs md:text-sm text-gray-700 mb-1 flex items-center gap-1">
                      <User className="w-3 h-3 md:w-4 md:h-4" />
                      Author
                    </h4>
                    <p className="text-xs md:text-sm text-gray-800">{selectedNode.attributes.author}</p>
                  </div>
                )}
                
                {selectedNode.attributes.description && (
                  <div>
                    <h4 className="font-semibold text-xs md:text-sm text-gray-700 mb-1">Description</h4>
                    <p className="text-xs md:text-sm text-gray-800">{selectedNode.attributes.description}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-semibold text-xs md:text-sm text-gray-700 mb-2">Citations</h4>
                  {selectedNode.attributes.citations?.length > 0 ? (
                    <ul className="space-y-1">
                      {selectedNode.attributes.citations.map((citation, index) => (
                        <li key={index} className="text-xs md:text-sm text-gray-600 flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          Reference #{citation}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs md:text-sm text-gray-500 italic">No citations</p>
                  )}
                </div>
                
                {selectedNode.attributes.ipfsCid && (
                  <div className="border-t pt-4">
                    <DocumentViewer documentCid={selectedNode.attributes.ipfsCid} />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 md:py-8">
                <FileText className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-2 md:mb-3" />
                <p className="text-gray-500 text-xs md:text-sm">
                  Click on a document to view details
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
