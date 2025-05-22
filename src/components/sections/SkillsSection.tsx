import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { portfolioData } from '../../data/portfolioData';
import * as d3 from 'd3';

const SkillsSection: React.FC = () => {
  const { theme } = useTheme();
  const { skills } = portfolioData;
  const chartRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();
    
    // Flatten all skills for visualization
    const allSkills = skills.flatMap(category => 
      category.skills.map(skill => ({
        name: skill.name,
        level: skill.level,
        category: category.category,
        color: skill.color || theme.colors.primary
      }))
    );
    
    // Set up dimensions
    const margin = { top: 30, right: 30, bottom: 70, left: 60 };
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(chartRef.current)
      .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // X axis
    const x = d3.scaleBand()
      .range([0, width])
      .domain(allSkills.map(d => d.name))
      .padding(0.2);
    
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
        .attr('transform', 'translate(-10,0)rotate(-45)')
        .style('text-anchor', 'end')
        .style('font-size', '12px')
        .style('fill', theme.mode === 'dark' ? '#fff' : '#000');
    
    // Y axis
    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);
    
    svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
        .style('font-size', '12px')
        .style('fill', theme.mode === 'dark' ? '#fff' : '#000');
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 0 - (margin.top / 2))
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('fill', theme.mode === 'dark' ? '#fff' : '#000')
      .text('Skills Proficiency');
    
    // Add bars with animation
    svg.selectAll('rect')
      .data(allSkills)
      .enter()
      .append('rect')
        .attr('x', d => x(d.name) as number)
        .attr('width', x.bandwidth())
        .attr('fill', d => d.color)
        .attr('y', height)
        .attr('height', 0)
        .transition()
        .duration(800)
        .delay((d, i) => i * 100)
        .attr('y', d => y(d.level))
        .attr('height', d => height - y(d.level));
    
    // Add values on top of bars
    svg.selectAll('.value')
      .data(allSkills)
      .enter()
      .append('text')
        .attr('class', 'value')
        .attr('x', d => (x(d.name) as number) + x.bandwidth() / 2)
        .attr('y', d => y(d.level) - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', theme.mode === 'dark' ? '#fff' : '#000')
        .style('opacity', 0)
        .transition()
        .duration(800)
        .delay((d, i) => i * 100 + 300)
        .style('opacity', 1)
        .text(d => `${d.level}%`);
    
  }, [skills, theme]);
  
  return (
    <section 
      id="skills" 
      className={`min-h-screen py-20 ${
        theme.mode === 'dark' ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="text-4xl font-bold mb-4">Skills & Expertise</h2>
          <p className="text-lg max-w-2xl mx-auto opacity-80">
            My technical skills and proficiency levels across different technologies and domains.
          </p>
        </motion.div>
        
        <div className="mb-16">
          <div 
            ref={chartRef} 
            className="w-full overflow-x-auto"
            style={{ minHeight: '400px' }}
          ></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skills.map((category, index) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`p-6 rounded-lg shadow-lg ${
                theme.mode === 'dark' ? 'bg-slate-700' : 'bg-white'
              }`}
            >
              <h3 className="text-xl font-semibold mb-4">{category.category}</h3>
              <div className="space-y-4">
                {category.skills.map(skill => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>{skill.name}</span>
                      <span className="text-sm opacity-80">{skill.level}%</span>
                    </div>
                    <div 
                      className="w-full h-2 rounded-full overflow-hidden bg-opacity-20"
                      style={{ backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.level}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: skill.color || theme.colors.primary }}
                      ></motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;