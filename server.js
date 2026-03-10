const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();

// =====================
// Middlewares
// =====================
app.use(express.json());
app.use(cors());

// =====================
// Archivos estáticos
// =====================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =====================
// Rutas
// =====================
// IMPORTANTE: la ruta de login debe ser clara y consistente
app.use("/api/auth", require("./routes/authRoutes"));   // LOGIN
app.use("/api/productos", require("./routes/productoRoutes"));
app.use("/api/pedidos", require("./routes/pedidoRoutes"));
app.use("/api/stats", require("./routes/statsRoutes"));
app.use("/api/users", require("./routes/users"));

// =====================
// Ruta de prueba
// =====================
app.get('/', (req, res) => {
    res.json({ 
        msg: "✅ API My Closet Sport funcionando",
        rutas: [
            "POST /api/auth/login",
            "GET  /api/productos",
            "POST /api/productos",
            "GET  /api/pedidos",
            "POST /api/pedidos",
            "GET  /api/stats/dashboard"
        ]
    });
});

// =====================
// Crear carpeta uploads
// =====================
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log('📁 Carpeta uploads creada');
}

// =====================
// MongoDB
// =====================
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Conectado a MongoDB Atlas"))
    .catch(err => {
        console.error("❌ Error conectando a MongoDB:", err);
        process.exit(1);
    });

// =====================
// Manejo de errores
// =====================
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ msg: "Error en el servidor", error: err.message });
});

// =====================
// Servidor
// =====================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
});
