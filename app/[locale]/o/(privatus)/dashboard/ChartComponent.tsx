'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 12000 },
  { month: 'Fév', revenue: 15000 },
  { month: 'Mar', revenue: 18000 },
  { month: 'Avr', revenue: 16000 },
  { month: 'Mai', revenue: 21000 },
  { month: 'Juin', revenue: 19000 },
];

export function RevenueChart() {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={revenueData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Bar dataKey="revenue" fill="#4F46E5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}