import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Activity,
  BarChart2,
  Clock,
  TrendingUp,
  TrendingDown,
  ChartLine,
  Gauge,
  MessageCircle,
} from "lucide-react";
import { io } from "socket.io-client";

// Import comments from transactions file
import commentsData from "./transactions";
import { CommentsSection } from "./CommentsSection";

const ForexDashboard = () => {
  // États pour les différentes données
  const [data, setData] = React.useState([]);
  const [realTimeData, setRealTimeData] = React.useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = React.useState("1H");
  const [indicators, setIndicators] = React.useState({
    currentPrice: "1.2034",
    change24h: "-0.25",
    rsi: "45.50",
    volume: "987654",
    predictions: "1.2035, 1.2038, 1.2032, 1.2040, 1.2037",
  });

  // Création des intervalles de temps fixes
  const fixedTimeSlots = Array.from({ length: 50 }, (_, i) => `${i}:00`);

  // Connexion Socket.IO et gestion des données en temps réel
  React.useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("new_price", (priceData) => {
      setRealTimeData((prevData) => {
        const updatedData = [...prevData, priceData];
        if (updatedData.length > 50) updatedData.shift();
        return updatedData;
      });
    });

    return () => socket.disconnect();
  }, []);

  // Génération des données initiales pour le graphique
  React.useEffect(() => {
    const generateInitialData = () => {
      const initialData = [];
      const basePrice = 1.2;
      for (let i = 0; i < 50; i++) {
        initialData.push({
          time: `${i}:00`,
          price: basePrice + Math.random() * 0.01,
          prediction: basePrice + Math.random() * 0.01,
        });
      }
      return initialData;
    };

    setData(generateInitialData());
  }, []);

  // Simulation de mise à jour en temps réel
  React.useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date().toLocaleTimeString();
      const mockPrice = 1.2 + Math.random() * 0.01;
      const mockPredictions = Array(5)
        .fill(0)
        .map(() => mockPrice + (Math.random() - 0.5) * 0.005);

      setData((prevData) => {
        const newData = [
          ...prevData.slice(1),
          {
            time: currentTime,
            price: mockPrice,
            prediction: mockPredictions[0],
          },
        ];
        return newData;
      });

      setIndicators((prev) => ({
        ...prev,
        currentPrice: mockPrice.toFixed(4),
        change24h: ((Math.random() - 0.5) * 2).toFixed(2),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Traitement des données en temps réel
  const processedRealTimeData = fixedTimeSlots.map((time, index) => ({
    time,
    price: realTimeData[index]?.price || null,
  }));

  // Options de timeframe
  const timeframes = ["5m", "15m", "1H", "4H", "1D"];

  // Fonction de défilement vers une section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Composant pour les cartes d'indicateurs
  const IndicatorCard = ({
    icon: Icon,
    title,
    value,
    color = "text-white",
  }) => (
    <div className="flex items-center justify-between bg-gray-700 p-4 rounded-lg mb-3 hover:bg-gray-600 transition-colors">
      <div className="flex items-center space-x-9">
        <Icon className={`h-6 w-6 ${color}`} />
        <div>
          <span className="text-gray-400 text">{title}</span>
          <br />
          <div className={`text-xl font-bold ${color}`}>{value}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-4 fixed h-full">
        <div className="flex items-center space-x-2 mb-8">
          <h1 className="text-xl font-bold text-white">FOREX VISION</h1>
        </div>
        <nav className="space-y-2">
          {[
            { icon: Gauge, text: "Indicators", section: "indicators" },
            { icon: ChartLine, text: "Real-Time", section: "real-time-chart" },
            { icon: ChartLine, text: "Chart", section: "chart" },
            { icon: Clock, text: "Predictions", section: "predictions" },
            { icon: MessageCircle, text: "Comments", section: "comments" },
          ].map((item) => (
            <button
              key={item.text}
              onClick={() => scrollToSection(item.section)}
              className="w-full flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-700 rounded"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.text}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">
        {/* Indicators Section */}
        <section id="indicators" className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Indicators</h2>
            <div className="flex space-x-2">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                    selectedTimeframe === tf
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <IndicatorCard
              icon={TrendingUp}
              title="Price"
              value={indicators.currentPrice}
            />
            <IndicatorCard
              icon={
                Number(indicators.change24h) >= 0 ? TrendingUp : TrendingDown
              }
              title="24h Change"
              value={`${indicators.change24h}%`}
              color={
                Number(indicators.change24h) >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }
            />
            <IndicatorCard
              icon={Activity}
              title="RSI"
              value={indicators.rsi}
              color={"text-blue-400"}
            />
            <IndicatorCard
              icon={BarChart2}
              title="Volume"
              value={indicators.volume}
              color={"text-purple-400"}
            />
          </div>
        </section>

        {/* Real-Time Chart Section */}
        <section id="real-time-chart" className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Real-Time Data</h2>
          <div className="bg-gray-800 rounded-lg p-4">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={processedRealTimeData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                  horizontal={true}
                />
                <XAxis
                  dataKey="time"
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  interval={2}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF" }}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "0.5rem",
                    padding: "0.5rem",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                  name="Real-Time Price"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Chart Section */}
        <section id="chart" className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Chart</h2>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="h-[600px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="time"
                    stroke="#9CA3AF"
                    tick={{ fill: "#9CA3AF" }}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    tick={{ fill: "#9CA3AF" }}
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "0.5rem",
                      padding: "0.5rem",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={false}
                    name="Price"
                  />
                  <Line
                    type="monotone"
                    dataKey="prediction"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Prediction"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Predictions Section */}
        <section id="predictions" className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Predictions</h2>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">Price Predictions</h3>
              <Clock className="text-yellow-400 h-5 w-5" />
            </div>
            <div className="font-mono text-yellow-400 text-lg">
              {indicators.predictions}
            </div>
          </div>
        </section>

        {/* Comments Section */}
        <CommentsSection commentsData={commentsData} />
      </div>
    </div>
  );
};

export default ForexDashboard;
