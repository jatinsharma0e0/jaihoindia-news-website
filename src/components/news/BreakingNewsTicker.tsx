import { mockBreakingNews } from '@/data/mockNews';

export function BreakingNewsTicker() {
  const headlines = mockBreakingNews.map((article) => article.title);
  const duplicatedHeadlines = [...headlines, ...headlines]; // Duplicate for seamless loop

  return (
    <div className="bg-foreground overflow-hidden">
      <div className="container py-2 flex items-center gap-4">
        {/* LIVE Badge */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-live-pulse absolute inline-flex h-full w-full rounded-full bg-news-live opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-news-live"></span>
          </span>
          <span className="bg-news-live text-primary-foreground px-2 py-0.5 text-xs font-bold uppercase rounded">
            LIVE
          </span>
        </div>

        {/* Ticker */}
        <div className="overflow-hidden flex-1">
          <div className="animate-ticker whitespace-nowrap flex items-center">
            {duplicatedHeadlines.map((headline, index) => (
              <span
                key={index}
                className="inline-flex items-center text-sm text-background/90 mr-8"
              >
                <span className="text-primary mr-2">●</span>
                {headline}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
