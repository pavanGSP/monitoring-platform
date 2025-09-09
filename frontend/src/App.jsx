
import React, { useEffect, useRef, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'

const fetchMetrics = async () => {
  const res = await fetch('/api/metrics')
  if (!res.ok) throw new Error('Failed to fetch metrics')
  return res.json()
}

export default function App() {
  const [data, setData] = useState([])
  const [latest, setLatest] = useState(null)
  const timerRef = useRef(null)

  const poll = async () => {
    try {
      const m = await fetchMetrics()
      setLatest(m)
      setData(d => [...d.slice(-49), { // keep last 50 points
        time: new Date(m.timestamp * 1000).toLocaleTimeString(),
        cpu: m.cpu_percent,
        latency: m.latency_ms,
        mem: m.memory_usage_mb,
        count: m.request_count
      }])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    poll()
    timerRef.current = setInterval(poll, 10000)
    return () => clearInterval(timerRef.current)
  }, [])

  return (
    <div style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui' }}>
      <h1 style={{ marginBottom: 16 }}>Monitoring Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <Card title="CPU %">{latest ? latest.cpu_percent.toFixed(2) : '—'}</Card>
        <Card title="Latency (ms)">{latest ? latest.latency_ms.toFixed(2) : '—'}</Card>
        <Card title="Memory (MB)">{latest ? latest.memory_usage_mb.toFixed(2) : '—'}</Card>
        <Card title="Request Count">{latest ? latest.request_count : '—'}</Card>
      </div>

      <div style={{ height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="cpu" name="CPU %" dot={false} />
            <Line yAxisId="left" type="monotone" dataKey="mem" name="Memory (MB)" dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="latency" name="Latency (ms)" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 12, background: 'white' }}>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 600 }}>{children}</div>
    </div>
  )
}
