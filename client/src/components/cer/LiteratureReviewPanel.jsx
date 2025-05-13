import { useState } from 'react';
import FDA510kService from '@/services/FDA510kService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';

export default function LiteratureReviewPanel() {
  const [litQuery, setLitQuery] = useState('');
  const [fromDate, setFromDate] = useState('2018-01-01');
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0,10));
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const runLiteratureReview = async () => {
    if (!litQuery.trim()) return;
    setLoading(true);
    try {
      const results = await FDA510kService.instance.literatureReview(litQuery, fromDate, toDate);
      setReviews(results);
      toast({ title: 'Review complete', description: `${results.length} papers summarized` });
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch literature' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-6">
      <h3 className="text-lg font-semibold">📚 Automated Literature Review</h3>
      <div className="flex flex-wrap gap-2 mt-3">
        <Input
          className="flex-1 min-w-[200px]"
          value={litQuery}
          onChange={e => setLitQuery(e.target.value)}
          placeholder="Enter keywords or questions…"
        />
        <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
        <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
        <Button onClick={runLiteratureReview} disabled={loading}>
          {loading ? <Spinner className="mr-2 h-4 w-4 animate-spin" /> : 'Review'}
        </Button>
      </div>
      <div className="mt-4 space-y-4 max-h-[50vh] overflow-auto">
        {reviews.map((paper, i) => (
          <Card key={i} className="p-4">
            <div className="flex justify-between">
              <h4 className="font-medium">{paper.title}</h4>
              <span className="text-xs text-gray-500">{paper.date}</span>
            </div>
            <p className="mt-2 text-sm text-gray-700">{paper.summary}</p>
            <a
              href={paper.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline mt-1 block"
            >
              View Full Article
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
}