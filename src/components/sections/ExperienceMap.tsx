import React from 'react';
import Plot from 'react-plotly.js';
import type { PlotParams } from 'react-plotly.js';

type ExperienceMapProps = {
  data: PlotParams['data'];
  layout: Partial<PlotParams['layout']>;
  config: PlotParams['config'];
};

/**
 * Plotly scattergeo map. Loaded only after Map View is chosen so the
 * home entry does not ship plotly.js (~90% of the previous main chunk).
 */
const ExperienceMap: React.FC<ExperienceMapProps> = ({ data, layout, config }) => (
  <Plot
    data={data}
    layout={layout}
    config={config}
    style={{
      width: '100%',
      borderRadius: '12px',
      overflow: 'hidden',
    }}
  />
);

export default ExperienceMap;
