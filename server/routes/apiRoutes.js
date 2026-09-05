import { Router } from 'express';
import { db } from '../config/db.js';
import { employeeProfiles, calculateDashboardMetrics } from '../services/metricsService.js';

const router = Router();

// Healthcheck
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Rework Round Analysis Backend API',
    version: '2.0.0 (Full-Stack React & Node)',
    dbType: db.dbType,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Employee Profiles
router.get('/employees', (req, res) => {
  res.json(employeeProfiles);
});

// Dashboard Data
router.get('/dashboard', async (req, res) => {
  try {
    const { employee = 'SUDHIN', date = '05-09-2026', period = 'day', role = 'All', status = 'All' } = req.query;
    const persistentResolutions = await db.getResolutions();
    const data = calculateDashboardMetrics(employee, date, period, { role, status }, persistentResolutions);
    res.json(data);
  } catch (err) {
    console.error('Error calculating dashboard data:', err);
    res.status(500).json({ error: 'Failed to calculate dashboard metrics: ' + err.message });
  }
});

// Save File Resolution
router.post('/resolve', async (req, res) => {
  try {
    const { employee, fileId, metadata } = req.body;
    if (!employee || !fileId) {
      return res.status(400).json({ error: 'Both employee and fileId are required' });
    }
    const result = await db.saveResolution(employee, fileId, metadata);
    res.json({
      success: true,
      message: `File ${fileId} marked as Corrected for ${employee}`,
      ...result
    });
  } catch (err) {
    console.error('Error saving resolution:', err);
    res.status(500).json({ error: 'Failed to save resolution: ' + err.message });
  }
});

// Get All Resolutions
router.get('/resolutions', async (req, res) => {
  try {
    const resolutions = await db.getResolutions();
    res.json(resolutions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resolutions: ' + err.message });
  }
});

// Reset Resolutions
router.post('/reset-resolutions', async (req, res) => {
  try {
    const result = await db.resetResolutions();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset resolutions: ' + err.message });
  }
});

export default router;
