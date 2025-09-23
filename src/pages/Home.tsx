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
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-glow">
              <img src={fraLogo} alt="FRA Atlas Logo" className="h-12 w-12 object-contain" />
            </div>
            <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              AI-Powered{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                FRA Atlas
              </span>{" "}
              & Decision Support System
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Digitize legacy FRA data, visualize claims through WebGIS, and get AI-powered 
              recommendations for CSS scheme eligibility. Empowering forest communities with technology.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              {!user ? (
                <>
                  <Button variant="hero" size="xl" asChild>
                    <Link to="/auth">
                      <LogIn className="mr-2 h-5 w-5" />
                      Sign In
                    </Link>
                  </Button>
                  
                  <Button variant="outline" size="xl" asChild>
                    <Link to="/auth">
                      <UserPlus className="mr-2 h-5 w-5" />
                      Register
                    </Link>
                  </Button>
                </>
              ) : isOfficial ? (
                <>
                  <Button variant="hero" size="xl" asChild>
                    <Link to="/atlas">
                      <MapPin className="mr-2 h-5 w-5" />
                      Explore Atlas
                    </Link>
                  </Button>
                  
                  <Button variant="outline" size="xl" asChild>
                    <Link to="/dss">
                      <Brain className="mr-2 h-5 w-5" />
                      Try DSS
                    </Link>
                  </Button>
                  
                  <Button variant="earth" size="xl" asChild>
                    <Link to="/dashboard">
                      <Database className="mr-2 h-5 w-5" />
                      Dashboard
                    </Link>
                  </Button>
                </>
              ) : isCitizen ? (
                <>
                  <Button variant="hero" size="xl" asChild>
                    <Link to="/apply-claim">
                      <FileText className="mr-2 h-5 w-5" />
                      Apply for Claim
                    </Link>
                  </Button>
                  
                  <Button variant="outline" size="xl" asChild>
                    <Link to="/my-claims">
                      <Database className="mr-2 h-5 w-5" />
                      View My Claims
                    </Link>
                  </Button>
                </>
              ) : null}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Impact & Progress
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Real-time statistics from our FRA digitization and mapping efforts
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total FRA Claims"
              value={mockStats.totalClaims.toLocaleString()}
              description="Claims processed across states"
              icon={TreePine}
              trend="+12%"
              color="primary"
            />
            <StatsCard
              title="Approved Claims"
              value={mockStats.approvedClaims.toLocaleString()}
              description="Successfully approved claims"
              icon={CheckCircle}
              trend="+8%"
              color="success"
            />
            <StatsCard
              title="Villages Covered"
              value={mockStats.villagesCovered.toLocaleString()}
              description="Villages with FRA mapping"
              icon={Users}
              trend="+15%"
              color="info"
            />
            <StatsCard
              title="Assets Mapped"
              value={mockStats.assetsMapped.toLocaleString()}
              description="AI-detected land assets"
              icon={Satellite}
              trend="+23%"
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