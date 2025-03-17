import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { faker } from "@faker-js/faker";
import { getExtenseData, getShortMonth, moneyFormat } from "@/src/helper";
import Api from "@/src/services/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Chart.js Line Chart",
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      min: 0,
    },
  },
};

const months: any = [
  { month: "Jan", value: 0 },
  { month: "Fev", value: 0 },
  { month: "Mar", value: 0 },
  { month: "Abr", value: 0 },
  { month: "Mai", value: 0 },
  { month: "Jun", value: 0 },
  { month: "Jul", value: 0 },
  { month: "Ago", value: 0 },
  { month: "Set", value: 0 },
  { month: "Out", value: 0 },
  { month: "Nov", value: 0 },
  { month: "Dez", value: 0 },
];

export function Chart(params: any) {
  const api = new Api();

  const [handleChart, setHandleChart] = useState({
    labels: [],
    values: [],
  } as any);

  const [chartResume, setChartResume] = useState([] as Array<any>);
  const getChartResume = async () => {
    const period = params?.period ?? "month";

    let datesRange = {
      start: "",
      end: "",
    };

    const today = new Date();

    if (period === "month") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1); // Primeiro dia do mês
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Último dia do mês

      datesRange = {
        start: start.toISOString().split("T")[0], // Converte para o formato "YYYY-MM-DD"
        end: end.toISOString().split("T")[0],
      };
    }

    if (period === "year") {
      const start = new Date(today.getFullYear(), 0, 1); // Primeiro dia do ano
      const end = new Date(today.getFullYear(), 11, 31); // Último dia do ano

      datesRange = {
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0],
      };
    }

    if (period === "semester") {
      const month = today.getMonth();
      if (month < 6) {
        const start = new Date(today.getFullYear(), 0, 1); // Primeiro dia do primeiro semestre
        const end = new Date(today.getFullYear(), 5, 30); // Último dia do primeiro semestre

        datesRange = {
          start: start.toISOString().split("T")[0],
          end: end.toISOString().split("T")[0],
        };
      } else {
        const start = new Date(today.getFullYear(), 6, 1); // Primeiro dia do segundo semestre
        const end = new Date(today.getFullYear(), 11, 31); // Último dia do segundo semestre

        datesRange = {
          start: start.toISOString().split("T")[0],
          end: end.toISOString().split("T")[0],
        };
      }
    }

    let request: any = await api.bridge({
      method: "post",
      url: "suborders/list",
      data: datesRange,
    });

    setChartResume(request.data);
  };

  const periodYear = () => {
    let handleLabel: any = months;

    chartResume?.map((item: any, key: any) => {
      let month = parseInt(getExtenseData(item.created_at, "m").toString());
      let m = getShortMonth(month);

      handleLabel.map((mo: any) => {
        mo.value += mo.month == m ? parseInt(item.total) : 0;
      });
    });

    setHandleChart({
      labels: handleLabel.map((item: any) => item.month),
      values: handleLabel.map((item: any) => item.value),
    });
  };

  const periodSemester = () => {
    const current =
      new Date().getMonth() < 6 ? [0, 1, 2, 3, 4, 5] : [6, 7, 8, 9, 10, 11];

    let handleLabel: any = months.filter((i: any, k: any) =>
      current.includes(k)
    );

    chartResume
      .filter((item: any, index: any) => current.includes(index))
      .map((item: any, key: any) => {
        let month = parseInt(getExtenseData(item.created_at, "m").toString());
        let m = getShortMonth(month);

        handleLabel.map((mo: any) => {
          mo.value += mo.month == m ? parseInt(item.total) : 0;
        });
      });

    setHandleChart({
      labels: handleLabel.map((item: any) => item.month),
      values: handleLabel.map((item: any) => item.value),
    });
  };

  const periodMonth = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    let handleLabel: any = [];

    for (
      let i = firstDayOfMonth.getDate();
      i <= lastDayOfMonth.getDate();
      i++
    ) {
      handleLabel.push({
        day: i,
        value: 0,
      });
    }

    chartResume?.map((item: any, key: any) => {
      let month = parseInt(getExtenseData(item.created_at, "m").toString());

      if (month == new Date().getMonth() + 1) {
        const d = new Date(item.created_at).getDate();

        handleLabel.map((label: any) => {
          label.value += label.day == d ? parseInt(item.total) : 0;
        });
      }
    });

    setHandleChart({
      labels: handleLabel.map((item: any) => item.day),
      values: handleLabel.map((item: any) => item.value),
    });
  };

  useEffect(() => {
    if (params.period == "month") periodMonth();
    if (params.period == "semester") periodSemester();
    if (params.period == "year") periodYear();
  }, [chartResume]);

  useEffect(() => {
    getChartResume();
  }, [params]);

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        displayColors: false,
        backgroundColor: "rgb(228 228 231 / 1)",
        bodyColor: "#222222",
        titleColor: "#222222",
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";

            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          borderDash: [3, 3],
        },
        ticks: {
          color: "rgba(0, 0, 0, 0.6)",
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        min: 0,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
          borderWidth: 1,
        },
        ticks: {
          color: "rgba(0, 0, 0, 0.6)",
          font: {
            size: 11,
          },
          callback: function (value: any) {
            return moneyFormat(value);
          },
        },
      },
    },
  };

  return (
    <Bar
      options={options}
      data={{
        labels: handleChart.labels,
        datasets: [
          {
            data: handleChart.values,
            borderColor: "rgb(0, 0, 0, 1)",
            backgroundColor: "rgba(255, 218, 74, 1)",
            borderWidth: 1,
          },
        ],
      }}
    />
  );
}
