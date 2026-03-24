import React from 'react';
import { ExternalLink } from 'lucide-react';

const UNESCOReport = () => {
  const reportUrl = 'https://rodrigocetina.github.io/Reporte-UNESCO-CA-Car/en/';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-2xl font-bold text-gray-800">
          The Regulation of Digital Platforms in Mexico, Central America and the Caribbean
        </h2>
        <a
          href={reportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Open in new tab
        </a>
      </div>

      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm"
           style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
        <iframe
          src={reportUrl}
          title="UNESCO Report — Central America & Caribbean"
          className="w-full h-full"
          style={{ border: 'none' }}
          allow="fullscreen"
        />
      </div>
    </div>
  );
};

export default UNESCOReport;
