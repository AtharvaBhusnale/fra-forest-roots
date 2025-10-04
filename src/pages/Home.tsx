import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import StatsCard from "@/components/common/StatsCard";
import { useAuth } from "@/contexts/AuthContext";
import { 
  MapPin, 
  Brain, 
  Upload, 
  TreePine, 
  Users, 
  BarChart3, 
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  Satellite,
  Database,
  Shield,
  LogIn,
  UserPlus,
  FileText
} from "lucide-react";
import { Link } from "react-router-dom";
import { mockStats } from "@/data/mockData";
import fraLogo from "@/assets/fra-logo.png";

export default function Home() {
  const { user, isOfficial, isCitizen } = useAuth();
  const features = [
    {
      icon: Database,
      title: "Data Digitization",
      description: "OCR and NER powered extraction of FRA documents with AI validation.",
      link: "/digitization"
    },
    {
      icon: MapPin,
      title: "Interactive Atlas",
      description: "WebGIS portal with real-time visualization of FRA claims and assets.",
      link: "/atlas"
    },
    {
      icon: Brain,
      title: "Decision Support",
      description: "AI-powered recommendations for CSS scheme eligibility and benefits.",
      link: "/dss"
    },
    {
      icon: Satellite,
      title: "Asset Mapping",
      description: "Satellite imagery analysis for land use, water bodies, and forest cover.",
      link: "/assets"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Comprehensive reporting and progress tracking at multiple levels.",
      link: "/dashboard"
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "Government-grade security with role-based access controls.",
      link: "/security"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground py-20 sm:py-28">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              FRA Atlas Dashboard
            </h1>
            <p className="text-lg sm:text-xl max-w-3xl mb-2">
              Comprehensive digital platform for Forest Rights Act monitoring, asset mapping,
            </p>
            <p className="text-lg sm:text-xl max-w-3xl mb-10">
              and decision support powered by AI and satellite technology
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="bg-white text-foreground hover:bg-white/90 font-medium px-8"
                asChild
              >
                <Link to="/digitization">
                  Digitize Documents
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white/10 font-medium px-8"
                asChild
              >
                <Link to="/dss">
                  Check Scheme Eligibility
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Claims"
              value="4.2M"
              description="Claims processed"
              icon={FileText}
              color="primary"
            />
            <StatsCard
              title="Titles Granted"
              value="1.8M"
              description="Successfully approved"
              icon={CheckCircle}
              color="success"
            />
            <StatsCard
              title="Beneficiaries"
              value="9.5M"
              description="People benefiting"
              icon={Users}
              color="info"
            />
            <StatsCard
              title="Area Covered"
              value="5.2M ha"
              description="Total area"
              icon={Satellite}
              color="warning"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Comprehensive FRA Solution
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              End-to-end digitization, visualization, and decision support for Forest Rights Act implementation
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                >
                  <Card className="group relative overflow-hidden border-border bg-gradient-card p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {feature.description}
                    </p>
                    <Link 
                      to={feature.link}
                      className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-glow transition-colors"
                    >
                      Learn more
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="rounded-2xl bg-gradient-primary p-8 shadow-strong sm:p-16"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
                Ready to Get Started?
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/80">
                Join thousands of forest communities and government officials using our platform 
                for transparent and efficient FRA implementation.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button variant="secondary" size="xl" asChild>
                  <Link to="/atlas">
                    Explore Atlas
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                  <Link to="/contact">
                    Contact Us
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}