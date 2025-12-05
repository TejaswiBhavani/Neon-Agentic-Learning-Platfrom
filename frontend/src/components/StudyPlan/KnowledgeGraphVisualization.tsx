import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { studyPlanService } from '../../services/api';

interface KnowledgeGraphVisualizationProps {
    domain: string;
}

const KnowledgeGraphVisualization: React.FC<KnowledgeGraphVisualizationProps> = ({ domain }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const networkRef = useRef<Network | null>(null);

    useEffect(() => {
        const fetchGraph = async () => {
            try {
                const response = await studyPlanService.getGraph(domain);
                const graphData = response.data;

                const nodes = new DataSet(
                    graphData.nodes.map((node: any) => ({
                        id: node.id,
                        label: node.name,
                        color: getNodeColor(node.level),
                        shape: 'box',
                        font: { color: 'white' }
                    }))
                );

                const edges = new DataSet(
                    graphData.links.map((link: any) => ({
                        from: link.source,
                        to: link.target,
                        arrows: 'to'
                    }))
                );

                if (containerRef.current) {
                    const data = { nodes, edges };
                    const options = {
                        layout: {
                            hierarchical: {
                                direction: 'LR',
                                sortMethod: 'directed',
                            },
                        },
                        physics: false,
                        interaction: {
                            dragNodes: false,
                            zoomView: true,
                        },
                    };

                    networkRef.current = new Network(containerRef.current, data as any, options);
                }
            } catch (error) {
                console.error("Failed to fetch graph", error);
            }
        };

        fetchGraph();

        return () => {
            if (networkRef.current) {
                networkRef.current.destroy();
            }
        };
    }, [domain]);

    const getNodeColor = (level: string) => {
        switch (level) {
            case 'beginner': return '#10B981'; // Emerald
            case 'intermediate': return '#3B82F6'; // Blue
            case 'advanced': return '#EF4444'; // Red
            default: return '#6B7280';
        }
    };

    return (
        <div className="h-full flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    Knowledge Graph
                    <span className="text-xs font-normal text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">Live</span>
                </h3>
            </div>
            <div className="flex-1 relative bg-gray-50/50">
                <div ref={containerRef} style={{ height: '100%', width: '100%' }} />

                {/* Legend Overlay */}
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-gray-200 text-xs shadow-lg">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center"><span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span> <span className="text-gray-600">Beginner</span></div>
                        <div className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> <span className="text-gray-600">Intermediate</span></div>
                        <div className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span> <span className="text-gray-600">Advanced</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KnowledgeGraphVisualization;
