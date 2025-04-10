// React Component: TagCorrelationHeatmap
// Heatmap for tag co-occurrence matrix

import { HeatMapGrid } from 'react-grid-heatmap';
import { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DownloadIcon, ImageIcon, FileIcon } from 'lucide-react';

interface TagCorrelationHeatmapProps {
  tagPairs: Record<string, number>;
}

export default function TagCorrelationHeatmap({ tagPairs }: TagCorrelationHeatmapProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const tagSet = new Set<string>();

  // Extract unique tags
  Object.keys(tagPairs).forEach(pair => {
    const [a, b] = pair.split('::');
    tagSet.add(a);
    tagSet.add(b);
  });

  const tags = Array.from(tagSet).sort();
  const matrix = tags.map(row =>
    tags.map(col => {
      if (row === col) return 0;
      const key = [row, col].sort().join('::');
      return tagPairs[key] || 0;
    })
  );
  
  // Find max value for color scaling
  const maxValue = Math.max(...matrix.flatMap(row => row));

  // Export chart as PNG or PDF
  const exportChart = (format: string) => {
    if (!chartRef.current) return;
    
    setIsExporting(true);
    
    // Using html2canvas library
    import('html2canvas').then(({ default: html2canvas }) => {
      html2canvas(chartRef.current as HTMLElement).then(canvas => {
        if (format === 'png') {
          // Export as PNG
          const link = document.createElement('a');
          link.download = `tag-correlation-${new Date().toISOString().slice(0, 10)}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          setIsExporting(false);
        } else {
          // Export as PDF
          import('jspdf').then(({ default: jsPDF }) => {
            const pdf = new jsPDF({
              orientation: 'landscape',
              unit: 'mm'
            });
            
            // Add title
            pdf.setFontSize(16);
            pdf.text('Tag Correlation Analysis', 14, 15);
            
            // Add date
            pdf.setFontSize(10);
            pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
            
            // Add chart image
            const imgData = canvas.toDataURL('image/png');
            const width = pdf.internal.pageSize.getWidth();
            const height = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, 'PNG', 10, 30, width - 20, height - 60);
            
            // Add footer
            pdf.setFontSize(8);
            pdf.text('TrialSage Study Design Agent Analysis Report', 14, height - 10);
            
            // Save the PDF
            pdf.save(`tag-correlation-${new Date().toISOString().slice(0, 10)}.pdf`);
            setIsExporting(false);
          }).catch(err => {
            console.error('Error generating PDF:', err);
            setIsExporting(false);
          });
        }
      });
    }).catch(err => {
      console.error('Error exporting chart:', err);
      setIsExporting(false);
    });
  };
  
  // If no data or only one tag, show empty state
  if (Object.keys(tagPairs).length === 0 || tags.length <= 1) {
    return null;
  }
  
  // Find the top 5 correlated pairs for insights
  const topCorrelations = Object.entries(tagPairs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([pair, count]) => {
      const [tag1, tag2] = pair.split('::');
      return { pair: `${tag1} & ${tag2}`, count };
    });

  return (
    <Card className="border border-gray-200 mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h4 className="text-md font-semibold text-rose-700">🧩 Tag Correlation Analysis</h4>
          
          <div className="relative group">
            <Button 
              onClick={() => exportChart('png')} 
              variant="outline" 
              size="sm" 
              disabled={isExporting}
              className="h-8 flex items-center gap-1"
            >
              {isExporting ? (
                <>Exporting...</>
              ) : (
                <>
                  <DownloadIcon size={14} />
                  Export
                </>
              )}
            </Button>
            <div className="absolute top-full right-0 mt-1 bg-white rounded-md shadow-md border border-gray-200 p-1 w-36 z-10 hidden group-hover:block">
              <Button
                onClick={() => exportChart('png')}
                variant="ghost"
                size="sm"
                className="w-full flex items-center justify-start gap-2 mb-1"
              >
                <ImageIcon size={14} />
                PNG Image
              </Button>
              <Button
                onClick={() => exportChart('pdf')}
                variant="ghost"
                size="sm"
                className="w-full flex items-center justify-start gap-2"
              >
                <FileIcon size={14} />
                PDF Document
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3" ref={chartRef}>
            <div style={{ fontSize: 12, overflow: 'auto' }}>
              <HeatMapGrid
                data={matrix}
                xLabels={tags}
                yLabels={tags}
                cellRender={(x, y, value) => value > 0 ? value : ''}
                cellStyle={(_, __, value) => ({
                  background: `rgba(255, 99, 132, ${value ? Math.min(value / Math.max(maxValue * 0.3, 1), 1) : 0})`,
                  color: value > (maxValue * 0.4) ? 'white' : 'black',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  borderRadius: '2px',
                  textAlign: 'center', 
                  margin: '1px',
                  height: '30px',
                  width: '30px'
                })}
                xLabelsStyle={(_) => ({
                  color: '#333',
                  fontSize: 10,
                  transform: 'rotate(-45deg)',
                  transformOrigin: 'top left',
                  paddingRight: '10px',
                  marginBottom: '20px'
                })}
                yLabelsStyle={() => ({
                  color: '#333',
                  fontSize: 10,
                  paddingRight: '10px',
                  textAlign: 'right',
                  width: '80px'
                })}
                cellHeight="30px"
                cellWidth="30px"
                square
              />
            </div>
          </div>
          
          <div className="lg:w-1/3">
            <div className="bg-rose-50 p-4 rounded-md border border-rose-100">
              <h5 className="text-sm font-medium text-rose-800 mb-2">Insights:</h5>
              
              {topCorrelations.length > 0 ? (
                <>
                  <p className="text-xs text-gray-700 mb-2">
                    Top tag correlations found in conversations:
                  </p>
                  <ul className="text-xs text-gray-700 space-y-1 list-disc pl-4">
                    {topCorrelations.map((item, i) => (
                      <li key={i}>
                        <span className="font-medium">{item.pair}</span>: {item.count} co-occurrences
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-xs text-gray-700">
                  No significant correlations found yet.
                </p>
              )}
              
              <p className="text-xs text-gray-700 mt-3">
                This heatmap reveals which topics are commonly discussed together.
                Strong correlations may indicate related concepts in clinical study design.
              </p>
              
              <div className="mt-4 pt-3 border-t border-rose-200">
                <h5 className="text-xs font-medium text-rose-800 mb-1">How to interpret:</h5>
                <p className="text-xs text-gray-700">
                  • Darker colors = stronger correlation between tags<br />
                  • Numbers show exact co-occurrence count<br />
                  • Empty cells indicate topics not mentioned together
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-3">
          Note: The diagonal is empty because self-correlations are excluded from the analysis.
        </p>
      </CardContent>
    </Card>
  );
}