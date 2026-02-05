/**
 * 基金图表组件
 * 基于 Lightweight Charts 实现的基金净值走势图
 */

import type { IChartApi, ISeriesApi } from "lightweight-charts";
import type { FundChartData, FundChartPeriod } from "~/types/fund";
import { Canvas, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { createChart, LineSeries } from "lightweight-charts";
import { useEffect, useRef, useState } from "react";

interface FundChartProps {
  /** 图表数据 */
  data: FundChartData[];
  /** 图表高度 */
  height?: number;
  /** 当前选中的时间周期 */
  period?: FundChartPeriod;
  /** 图表加载状态 */
  loading?: boolean;
}

export default function FundChart({ data = [], height = 400, period = "1m", loading = false }: FundChartProps) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const [canvasId] = useState(() => `fund-chart-${Math.random().toString(36).substr(2, 9)}`);

  // 初始化图表（H5：有数据且容器挂载后创建，避免 clientWidth 为 0）
  useEffect(() => {
    if (process.env.TARO_ENV !== "h5" || !chartContainerRef.current || chartRef.current) {
      return;
    }
    const el = chartContainerRef.current;
    const w = el.clientWidth || 300;
    const chart = createChart(el, {
      width: w,
      height,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#333",
      },
      grid: {
        vertLines: { color: "#f0f0f0" },
        horzLines: { color: "#f0f0f0" },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: "#cccccc",
      },
      timeScale: {
        borderColor: "#cccccc",
      },
    });

    const lineSeries = chart.addSeries(LineSeries, {
      color: "#165dff",
      lineWidth: 2,
      priceFormat: {
        type: "price",
        precision: 4,
        minMove: 0.0001,
      },
    });

    chartRef.current = chart;
    seriesRef.current = lineSeries;

    // 处理窗口大小调整
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [height, data.length]);

  // 将 "YYYY-MM-DD" 转为 lightweight-charts v5 的 BusinessDay 格式
  const toBusinessDay = (timeStr: string) => {
    const [y, m, d] = timeStr.split("-").map(Number);
    return { year: y, month: m, day: d };
  };

  // 更新图表数据
  useEffect(() => {
    if (chartRef.current && seriesRef.current && data.length > 0) {
      const chartData = data.map(item => ({
        time: toBusinessDay(item.time),
        value: item.value,
      }));

      seriesRef.current.setData(chartData);

      setTimeout(() => {
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent();
        }
      }, 100);
    }
  }, [data]);

  // 处理小程序Canvas触摸事件（定义在 renderMiniProgramChart 之前，避免 used before defined）
  const handleCanvasTouch = (e: any) => {
    console.log("Canvas touch:", e);
  };

  // 小程序环境的 Canvas 实现：用带 id 的 View 包裹，便于 createSelectorQuery 取到尺寸
  const renderMiniProgramChart = () => {
    if (process.env.TARO_ENV !== "h5") {
      return (
        <View id={canvasId} style={{ width: "100%", height: `${height}rpx` }} className="block">
          <Canvas canvasId={canvasId} style={{ width: "100%", height: "100%" }} onTouchStart={handleCanvasTouch} />
        </View>
      );
    }
    return null;
  };

  const drawMiniProgramChart = () => {
    const ctx = Taro.createCanvasContext(canvasId);
    if (!ctx || data.length === 0) {
      return;
    }

    // 查询包裹 Canvas 的 View 尺寸（小程序下 #canvasId 指向该 View）
    const doDraw = (rect: { width: number; height: number } | null) => {
      if (!rect || !rect.width || !rect.height) {
        return;
      }

      const { width, height: canvasHeight } = rect;
      const padding = 40;
      const chartWidth = width - padding * 2;
      const chartHeight = canvasHeight - padding * 2;

      // 清除画布
      ctx.clearRect(0, 0, width, canvasHeight);

      // 计算数据范围
      const values = data.map(d => d.value);
      const minValue = Math.min(...values);
      const maxValue = Math.max(...values);
      const valueRange = maxValue - minValue;

      if (valueRange === 0) {
        return;
      }

      // 绘制背景
      ctx.setFillStyle("#ffffff");
      ctx.fillRect(0, 0, width, canvasHeight);

      // 绘制网格线
      ctx.setStrokeStyle("#f0f0f0");
      ctx.setLineWidth(1);

      // 垂直网格线
      for (let i = 0; i <= 4; i++) {
        const x = padding + (chartWidth / 4) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, padding + chartHeight);
        ctx.stroke();
      }

      // 水平网格线
      for (let i = 0; i <= 4; i++) {
        const y = padding + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + chartWidth, y);
        ctx.stroke();
      }

      // 绘制数据线
      ctx.setStrokeStyle("#165dff");
      ctx.setLineWidth(2);
      ctx.beginPath();

      data.forEach((point, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // 绘制数据点
      ctx.setFillStyle("#165dff");
      data.forEach((point, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });

      // 绘制 Y 轴标签
      ctx.setFillStyle("#666");
      ctx.setFontSize(12);
      for (let i = 0; i <= 4; i++) {
        const value = minValue + (valueRange / 4) * (4 - i);
        const y = padding + (chartHeight / 4) * i;
        ctx.fillText(value.toFixed(4), 5, y + 3);
      }

      // 绘制 X 轴日期（首、中、末）
      const bottomY = padding + chartHeight + 14;
      const formatDate = (timeStr: string) => {
        const parts = timeStr.split("-");
        if (parts.length >= 3) {
          return `${parts[1]}-${parts[2]}`;
        }
        return timeStr;
      };
      const indices = [0, Math.floor(data.length / 2), data.length - 1].filter(i => i >= 0 && i < data.length);
      const uniq = Array.from(new Set(indices));
      uniq.forEach(idx => {
        const label = formatDate(data[idx].time);
        const textW = typeof ctx.measureText === "function" ? ctx.measureText(label).width : label.length * 7;
        const x = padding + (chartWidth / Math.max(1, data.length - 1)) * idx - textW / 2;
        const clampedX = Math.max(padding, Math.min(padding + chartWidth - textW, x));
        ctx.fillText(label, clampedX, bottomY);
      });

      ctx.draw();
    };

    // 延迟一帧再查询，确保小程序内节点已布局
    setTimeout(() => {
      Taro.createSelectorQuery()
        .select(`#${canvasId}`)
        .boundingClientRect((rect: any) => {
          doDraw(rect);
        })
        .exec();
    }, 80);
  };

  // 小程序Canvas绘制逻辑（effect 放在 drawMiniProgramChart 定义之后，避免 used before defined）
  useEffect(() => {
    if (process.env.TARO_ENV !== "h5" && data.length > 0) {
      drawMiniProgramChart();
    }
  }, [data, canvasId]);

  if (loading) {
    return (
      <div className="h-400rpx flex items-center justify-center">
        <span className="text-gray-5">图表加载中...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-400rpx flex items-center justify-center">
        <span className="text-gray-5">暂无图表数据</span>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* H5环境 */}
      {process.env.TARO_ENV === "h5" && (
        <div ref={chartContainerRef} style={{ height: `${height}px` }} className="w-full" />
      )}

      {/* 小程序环境 */}
      {renderMiniProgramChart()}

      {/* 图表信息覆盖层 */}
      <div className="absolute left-16rpx top-16rpx text-24rpx text-gray-6">
        <div>周期: {period}</div>
      </div>
    </div>
  );
}
