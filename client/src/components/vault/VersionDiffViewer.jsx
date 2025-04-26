import React from 'react';
import {
  ScrollArea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Separator,
} from '@/components/ui';

/**
 * VersionDiffViewer component
 * Displays the differences between two document versions
 * 
 * @param {Object} diff - The diff object containing comparison data
 * @param {string} baseVersionNumber - The base version number
 * @param {string} compareVersionNumber - The compare version number
 */
export function VersionDiffViewer({ diff, baseVersionNumber, compareVersionNumber, isLoading, error }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin h-6 w-6 rounded-full border-t-2 border-b-2 border-hotpink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 border border-red-200 rounded-md bg-red-50 text-red-800">
        <p>Error loading comparison: {error.message}</p>
      </div>
    );
  }

  if (!diff) return null;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Version Comparison</CardTitle>
        <CardDescription>
          Comparing version {baseVersionNumber} to version {compareVersionNumber}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="comparison-results">
          <div className="stats flex gap-4 mb-4">
            <div className="stat p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Changes</p>
              <p className="text-xl font-semibold">{diff.stats.percentChanged}%</p>
            </div>
            <div className="stat p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Insertions</p>
              <p className="text-xl font-semibold text-green-600">+{diff.stats.insertions}</p>
            </div>
            <div className="stat p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Deletions</p>
              <p className="text-xl font-semibold text-red-600">-{diff.stats.deletions}</p>
            </div>
            <div className="stat p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-semibold">{diff.stats.total} chars</p>
            </div>
          </div>

          <Tabs defaultValue="inline">
            <TabsList>
              <TabsTrigger value="inline">Inline Diff</TabsTrigger>
              <TabsTrigger value="sideBySide">Side by Side</TabsTrigger>
              <TabsTrigger value="lineByLine">Line by Line</TabsTrigger>
            </TabsList>
            <TabsContent value="inline" className="mt-2">
              <ScrollArea className="h-[400px] border rounded-md p-2">
                {diff.diffs.map((diffItem, index) => (
                  <div 
                    key={index} 
                    className={`diff-block p-1 mb-1 ${
                      diffItem.type === 'delete' 
                        ? 'bg-red-50 text-red-800 border-l-2 border-red-400' 
                        : diffItem.type === 'insert' 
                          ? 'bg-green-50 text-green-800 border-l-2 border-green-400' 
                          : ''
                    }`}
                  >
                    {diffItem.text}
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="sideBySide" className="mt-2">
              <div className="grid grid-cols-2 gap-4">
                <ScrollArea className="h-[400px] border rounded-md p-2">
                  <h3 className="font-medium mb-2 text-blue-700">Base Version (v{baseVersionNumber})</h3>
                  <pre className="text-sm whitespace-pre-wrap">
                    {diff.rawText.base}
                  </pre>
                </ScrollArea>
                <ScrollArea className="h-[400px] border rounded-md p-2">
                  <h3 className="font-medium mb-2 text-green-700">Compare Version (v{compareVersionNumber})</h3>
                  <pre className="text-sm whitespace-pre-wrap">
                    {diff.rawText.compare}
                  </pre>
                </ScrollArea>
              </div>
            </TabsContent>
            <TabsContent value="lineByLine" className="mt-2">
              <ScrollArea className="h-[400px] border rounded-md p-2">
                <table className="w-full border-separate border-spacing-0">
                  <thead>
                    <tr>
                      <th className="w-[50px] text-left p-1 text-xs text-gray-500 border-b">#</th>
                      <th className="text-left p-1 text-xs text-gray-500 border-b">Content</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diff.diffs.flatMap((diffItem, diffIndex) => 
                      diffItem.lines.map((line, lineIndex) => (
                        <tr 
                          key={`${diffIndex}-${lineIndex}`}
                          className={
                            line.type === 'delete' 
                              ? 'bg-red-50'
                              : line.type === 'insert' 
                                ? 'bg-green-50'
                                : ''
                          }
                        >
                          <td className="border-r px-2 py-1 text-xs text-gray-500">
                            {line.type === 'delete' ? '-' : line.type === 'insert' ? '+' : lineIndex + 1}
                          </td>
                          <td 
                            className={`px-2 py-1 font-mono text-xs whitespace-pre ${
                              line.type === 'delete' 
                                ? 'text-red-800' 
                                : line.type === 'insert' 
                                  ? 'text-green-800' 
                                  : ''
                            }`}
                          >
                            {line.text}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}

export default VersionDiffViewer;