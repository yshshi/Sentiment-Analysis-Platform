import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useLocation } from 'wouter';

ChartJS.register(ArcElement, Tooltip, Legend);

interface SentimentPieChartProps {
  percentages: {
    Positive: number;
    Negative: number;
    Neutral: number;
  };
}

export function SentimentPieChart({ percentages }: SentimentPieChartProps) {
  const [, setLocation] = useLocation();

  const data = {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [
      {
        data: [percentages.Positive, percentages.Negative, percentages.Neutral],
        backgroundColor: [
          'hsl(142, 71%, 45%)',
          'hsl(0, 84%, 60%)',
          'hsl(220, 9%, 46%)',
        ],
        borderColor: [
          'hsl(142, 71%, 35%)',
          'hsl(0, 84%, 50%)',
          'hsl(220, 9%, 36%)',
        ],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          font: {
            size: 14,
            family: 'Inter, sans-serif',
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          family: 'Inter, sans-serif',
        },
        bodyFont: {
          size: 13,
          family: 'Inter, sans-serif',
        },
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value.toFixed(2)}%`;
          }
        }
      },
    },
    onClick: (_event: any, elements: any[]) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const sentiment = ['positive', 'negative', 'neutral'][index];
        setLocation(`/details/${sentiment}`);
      }
    },
  };

  return (
    <div className="w-full max-w-md mx-auto" data-testid="pie-chart">
      <Pie data={data} options={options} />
      <p className="text-center text-sm text-muted-foreground mt-4">
        Click on any segment to view detailed reviews
      </p>
    </div>
  );
}
