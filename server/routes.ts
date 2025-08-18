import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPatientSchema, insertAppointmentSchema, insertMetricsSchema, insertChartDataSchema, insertTransactionSchema } from "@shared/schema";
import aiRoutes from "./ai-routes";
import { initializeHealthcareAgent } from "./ai-agent-deepseek";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize AI agent with storage
  initializeHealthcareAgent(storage);
  
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

  // Metrics routes - Calculate real-time metrics
  app.get("/api/metrics", async (req, res) => {
    try {
      // Get real-time data
      const patients = await storage.getAllPatients();
      const appointments = await storage.getAllAppointments();
      
      // Calculate dynamic metrics
      const totalPatients = patients.length;
      const totalAppointments = appointments.length;
      
      // Calculate completed appointments (treatments)
      const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
      
      // Mock income calculation (in a real app, this would be from transactions)
      const totalIncome = completedAppointments * 150; // $150 average per treatment
      
      // Growth calculations (simplified - in reality this would compare with previous period)
      const patientGrowth = "+12%";
      const appointmentGrowth = "+8%";
      const incomeGrowth = "+15%";
      const treatmentGrowth = "+10%";
      
      const metrics = {
        id: "dynamic-metrics",
        totalPatients,
        totalAppointments,
        totalIncome,
        totalTreatments: completedAppointments,
        patientGrowth,
        appointmentGrowth,
        incomeGrowth,
        treatmentGrowth,
        updatedAt: new Date()
      };
      
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

  // Chart data routes - Generate dynamic chart data
  app.get("/api/chart-data", async (req, res) => {
    try {
      const patients = await storage.getAllPatients();
      const appointments = await storage.getAllAppointments();
      
      // Generate realistic chart data based on actual data counts
      const currentMonth = new Date().getMonth();
      const currentPatientCount = patients.length;
      const currentAppointmentCount = appointments.length;
      
      const chartData = [
        {
          id: "jan",
          month: "Jan",
          hospitalizedPatients: Math.max(100, Math.floor(currentPatientCount * 0.8)),
          outPatients: Math.max(50, Math.floor(currentPatientCount * 0.4))
        },
        {
          id: "feb", 
          month: "Feb",
          hospitalizedPatients: Math.max(120, Math.floor(currentPatientCount * 0.85)),
          outPatients: Math.max(60, Math.floor(currentPatientCount * 0.45))
        },
        {
          id: "mar",
          month: "Mar", 
          hospitalizedPatients: Math.max(140, Math.floor(currentPatientCount * 0.9)),
          outPatients: Math.max(70, Math.floor(currentPatientCount * 0.5))
        },
        {
          id: "apr",
          month: "Apr",
          hospitalizedPatients: Math.max(130, Math.floor(currentPatientCount * 0.88)),
          outPatients: Math.max(65, Math.floor(currentPatientCount * 0.48))
        },
        {
          id: "may",
          month: "May",
          hospitalizedPatients: Math.max(160, Math.floor(currentPatientCount * 0.95)),
          outPatients: Math.max(80, Math.floor(currentPatientCount * 0.55))
        },
        {
          id: "jun",
          month: "Jun",
          hospitalizedPatients: currentPatientCount,
          outPatients: Math.floor(currentPatientCount * 0.6)
        }
      ];
      
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

  // Transaction routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const transaction = await storage.getTransaction(req.params.id);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      console.log("Raw request body:", req.body);
      const validatedData = insertTransactionSchema.parse(req.body);
      console.log("Validated data:", validatedData);
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Transaction creation error:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
        console.error("Error stack:", error.stack);
      }
      res.status(400).json({ message: "Invalid transaction data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const transaction = await storage.getTransaction(req.params.id);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      const validatedData = insertTransactionSchema.parse(req.body);
      const updatedTransaction = await storage.updateTransaction(req.params.id, validatedData);
      res.json(updatedTransaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const transaction = await storage.getTransaction(req.params.id);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      await storage.deleteTransaction(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete transaction" });
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
