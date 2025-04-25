import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "../lightweight-wrappers.js";
import { motion } from "framer-motion";

export default function DemoStart() {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    company: "",
    role: "Regulatory Affairs",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Show loading toast
      toast.loading("Provisioning your sandbox environment...", { id: "demo-provision" });
      
      // In a production environment, this would make an actual API call
      // For demo purposes, simulate an API response after a short delay
      setTimeout(() => {
        // Dismiss the loading toast
        toast.dismiss("demo-provision");
        
        // Store token in localStorage (simulated auth)
        localStorage.setItem("token", "demo-" + Math.random().toString(36).substring(2, 15));
        
        // Show success toast
        toast.success("Sandbox ready – launching demo!", {
          duration: 3000,
          icon: "🚀"
        });
        
        // Navigate to demo page
        navigate("/demo");
      }, 2000);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      toast.dismiss("demo-provision");
      toast.error("Failed to provision sandbox. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Hero section with animated background */}
      <section className="relative flex-1 flex items-center justify-center overflow-hidden p-6">
        {/* Animated blobs in background */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="absolute inset-0 -z-10">
          <motion.div 
            className="absolute w-96 h-96 bg-regulatory-400/50 rounded-full filter blur-3xl" 
            style={{ top: "10%", left: "20%" }} 
            animate={{ y: [0, 15, -15, 0] }} 
            transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute w-[30rem] h-[30rem] bg-indigo-300/40 rounded-full filter blur-3xl" 
            style={{ bottom: "-5rem", right: "-4rem" }} 
            animate={{ y: [0, -20, 20, 0] }} 
            transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
          />
        </motion.div>
        
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Demo info */}
          <div className="space-y-6 max-w-xl">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-regulatory-100 dark:bg-regulatory-900/30 backdrop-blur-sm text-regulatory-600 dark:text-regulatory-300 text-xs font-medium">
              <span className="flex h-1.5 w-1.5 rounded-full bg-regulatory-500 mr-1.5"></span>
              Exclusive Preview Access
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
              Experience the Future of Regulatory Intelligence
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Get instant access to the TrialSage™ platform with AI-powered IND preparation, CSR intelligence, and automated document generation.
            </p>
            
            <div className="space-y-4 pt-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-regulatory-100 dark:bg-regulatory-900/30 flex items-center justify-center mr-3">
                  <span className="text-regulatory-600 dark:text-regulatory-400 text-sm">✓</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">Full access to the IND Wizard 3.3 with predictive insights</p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-regulatory-100 dark:bg-regulatory-900/30 flex items-center justify-center mr-3">
                  <span className="text-regulatory-600 dark:text-regulatory-400 text-sm">✓</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">Preloaded CSR library with SDTM validation rules</p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-regulatory-100 dark:bg-regulatory-900/30 flex items-center justify-center mr-3">
                  <span className="text-regulatory-600 dark:text-regulatory-400 text-sm">✓</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">DocuShare integration for document management</p>
              </div>
            </div>
          </div>
          
          {/* Right column - Form */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Start Your Demo</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Work Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-regulatory-500 dark:focus:ring-regulatory-400"
                    placeholder="name@company.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-regulatory-500 dark:focus:ring-regulatory-400"
                    placeholder="John Smith"
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Company
                  </label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    required
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-regulatory-500 dark:focus:ring-regulatory-400"
                    placeholder="Acme Pharma"
                  />
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-regulatory-500 dark:focus:ring-regulatory-400"
                  >
                    <option value="Regulatory Affairs">Regulatory Affairs</option>
                    <option value="Clinical Operations">Clinical Operations</option>
                    <option value="Medical Writing">Medical Writing</option>
                    <option value="Medical Affairs">Medical Affairs</option>
                    <option value="R&D">R&D</option>
                    <option value="Executive">Executive</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full px-6 py-3 rounded-md bg-regulatory-600 hover:bg-regulatory-700 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-regulatory-500 focus:ring-offset-2 ${
                      isLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? "Setting up your demo..." : "Launch Demo"}
                  </button>
                </div>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
                  By registering, you agree to our Terms of Service and Privacy Policy.
                  Your information will never be shared with third parties.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}