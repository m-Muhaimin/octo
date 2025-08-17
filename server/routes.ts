import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPatientSchema, insertAppointmentSchema, insertMetricsSchema, insertChartDataSchema } from "@shared/schema";
import aiRoutes from "./ai-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register AI routes
  app.use("/api", aiRoutes);

  // Patients routes
  app.get("/api/patients", async (req, res) => {
    try {
      const patients = await storage.getAllPatients();
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.get("/api/patients/:id", async (req, res) => {
    try {
      const patient = await storage.getPatient(req.params.id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  app.post("/api/patients", async (req, res) => {
    try {
      const validatedData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(validatedData);
      res.status(201).json(patient);
    } catch (error) {
      res.status(400).json({ message: "Invalid patient data" });
    }
  });

  app.put("/api/patients/:id", async (req, res) => {
    try {
      const patient = await storage.getPatient(req.params.id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      const validatedData = insertPatientSchema.parse(req.body);
      const updatedPatient = await storage.updatePatient(req.params.id, validatedData);
      res.json(updatedPatient);
    } catch (error) {
      res.status(400).json({ message: "Invalid patient data" });
    }
  });

  app.delete("/api/patients/:id", async (req, res) => {
    try {
      const patient = await storage.getPatient(req.params.id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      await storage.deletePatient(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete patient" });
    }
  });

  // Appointments routes
  app.get("/api/appointments", async (req, res) => {
    try {
      const appointments = await storage.getAllAppointments();
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get("/api/appointments/:id", async (req, res) => {
    try {
      const appointment = await storage.getAppointment(req.params.id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointment" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      res.status(400).json({ message: "Invalid appointment data" });
    }
  });

  app.put("/api/appointments/:id", async (req, res) => {
    try {
      const appointment = await storage.getAppointment(req.params.id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      const validatedData = insertAppointmentSchema.parse(req.body);
      const updatedAppointment = await storage.updateAppointment(req.params.id, validatedData);
      res.json(updatedAppointment);
    } catch (error) {
      res.status(400).json({ message: "Invalid appointment data" });
    }
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      const appointment = await storage.getAppointment(req.params.id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      await storage.deleteAppointment(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });

  // Metrics routes
  app.get("/api/metrics", async (req, res) => {
    try {
      const metrics = await storage.getMetrics();
      if (!metrics) {
        return res.status(404).json({ message: "Metrics not found" });
      }
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  app.put("/api/metrics", async (req, res) => {
    try {
      const validatedData = insertMetricsSchema.parse(req.body);
      const metrics = await storage.updateMetrics(validatedData);
      res.json(metrics);
    } catch (error) {
      res.status(400).json({ message: "Invalid metrics data" });
    }
  });

  // Chart data routes
  app.get("/api/chart-data", async (req, res) => {
    try {
      const chartData = await storage.getChartData();
      res.json(chartData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chart data" });
    }
  });

  app.post("/api/chart-data", async (req, res) => {
    try {
      const validatedData = insertChartDataSchema.parse(req.body);
      const data = await storage.createChartData(validatedData);
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ message: "Invalid chart data" });
    }
  });

  // AI Agent endpoints
  app.post("/api/ai/query", async (req, res) => {
    const { query, context, patient_id } = req.body;
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Generate mock AI response based on query
    let response;
    if (query.toLowerCase().includes('claim')) {
      response = {
        answer: `I've analyzed the insurance claims. Here are the findings:\n\n• 12 claims have >90% approval likelihood\n• 3 claims need additional documentation\n• Average processing time: 3.2 days\n• Potential revenue: $42,500\n\nWould you like me to prioritize the high-risk claims for review?`,
        confidence: 92,
        sources: ['Insurance Knowledge Base', 'Practice Data', 'Claims History'],
        actionable: true
      };
    } else if (query.toLowerCase().includes('billing')) {
      response = {
        answer: `Billing Analysis Complete:\n\n• Outstanding: $28,450 (15 accounts)\n• 30+ days overdue: $12,200\n• Collection success rate: 94.2%\n• Recommended actions: 5 accounts for follow-up\n\nShall I initiate automated follow-up sequences for overdue accounts?`,
        confidence: 88,
        sources: ['Billing System', 'Payment History', 'Collection Analytics'],
        actionable: true
      };
    } else if (query.toLowerCase().includes('appointment')) {
      response = {
        answer: `Appointment Efficiency Report:\n\n• Average wait time: 12 minutes\n• No-show rate: 8.3% (below industry average)\n• Peak utilization: Tuesday/Thursday 2-4 PM\n• Optimization opportunity: +15% capacity during off-peak hours\n\nRecommendation: Implement smart scheduling algorithms.`,
        confidence: 90,
        sources: ['Scheduling System', 'Patient Flow Data', 'Industry Benchmarks'],
        actionable: true
      };
    } else {
      response = {
        answer: `Based on your query "${query}", I can provide detailed analysis and recommendations. Our AI system has access to:\n\n• Medical knowledge base with latest guidelines\n• Insurance policies and claim requirements\n• Patient data and treatment histories\n• Billing and collection best practices\n\nPlease specify which area you'd like me to focus on for more detailed insights.`,
        confidence: 75,
        sources: ['Medical Knowledge Base', 'Practice Data'],
        actionable: false
      };
    }
    
    res.json({
      status: 'success',
      response: response
    });
  });

  app.get("/api/ehr/systems", async (req, res) => {
    res.json({
      systems: [
        { id: 'athenahealth', name: 'athenahealth', status: 'active' },
        { id: 'drchrono', name: 'DrChrono', status: 'active' },
        { id: 'epic', name: 'Epic', status: 'beta' },
        { id: 'cerner', name: 'Cerner', status: 'planned' }
      ]
    });
  });

  app.post("/api/ehr/sync-patient", async (req, res) => {
    const { patient_id, ehr_system = 'athenahealth' } = req.body;
    
    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    res.json({
      status: 'success',
      data: {
        patient_id,
        ehr_system,
        sync_timestamp: new Date().toISOString(),
        records_synced: Math.floor(Math.random() * 50) + 10,
        status: 'completed'
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
