import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TreePine, Users, Shield, Lightbulb, Target, Globe } from "lucide-react";

export default function About() {
  const objectives = [
    {
      icon: TreePine,
      title: "Digitize Legacy FRA Data",
      description: "Convert paper-based FRA records into structured digital format using OCR and NER technologies."
    },
    {
      icon: Globe,
      title: "Create Interactive Atlas",
      description: "Build comprehensive WebGIS portal showing potential and granted FRA areas with satellite imagery."
    },
    {
      icon: Lightbulb,
      title: "AI-Powered Insights",
      description: "Use machine learning for asset mapping and automated scheme recommendation system."
    },
    {
      icon: Users,
      title: "Empower Communities",
      description: "Provide transparent access to FRA data and government scheme eligibility information."
    }
  ];

  const features = [
    "OCR and NER powered document digitization",
    "Real-time WebGIS visualization of FRA claims",
    "Satellite-based asset mapping and monitoring",
    "AI-driven CSS scheme recommendations",
    "Multi-level progress tracking and reporting",
    "Mobile-responsive community interface",
    "Government-grade security and compliance",
    "Integration with existing government systems"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary shadow-glow">
              <TreePine className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">About FRA Atlas</h1>
            <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
              Transforming Forest Rights Act implementation through AI-powered digitization, 
              interactive mapping, and intelligent decision support systems.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
          <div className="bg-gradient-card rounded-2xl p-8 shadow-soft">
            <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl mx-auto">
              To digitize and modernize the Forest Rights Act implementation process by leveraging 
              cutting-edge AI technologies, satellite imagery, and WebGIS platforms. Our goal is to 
              create a transparent, efficient, and accessible system that empowers forest communities 
              while supporting government officials in making data-driven decisions for sustainable 
              forest management and community development.
            </p>
          </div>
        </motion.div>

        {/* Key Objectives */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Key Objectives</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {objectives.map((objective, index) => {
              const Icon = objective.icon;
              return (
                <motion.div
                  key={objective.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="h-full hover:shadow-medium transition-all duration-300 border-border bg-gradient-card">
                    <CardHeader className="text-center">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{objective.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-center">
                        {objective.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Technology Stack</h2>
          <div className="grid gap-8 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Frontend Technologies</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">React</Badge>
                  <Badge variant="secondary">TypeScript</Badge>
                  <Badge variant="secondary">TailwindCSS</Badge>
                  <Badge variant="secondary">Framer Motion</Badge>
                  <Badge variant="secondary">ShadCN/UI</Badge>
                  <Badge variant="secondary">Vite</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <span>Mapping & GIS</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Mapbox GL JS</Badge>
                  <Badge variant="secondary">Leaflet</Badge>
                  <Badge variant="secondary">GeoJSON</Badge>
                  <Badge variant="secondary">PostGIS</Badge>
                  <Badge variant="secondary">QGIS</Badge>
                  <Badge variant="secondary">Satellite Imagery</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <span>AI & Backend</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">OCR</Badge>
                  <Badge variant="secondary">NER</Badge>
                  <Badge variant="secondary">Machine Learning</Badge>
                  <Badge variant="secondary">Node.js</Badge>
                  <Badge variant="secondary">PostgreSQL</Badge>
                  <Badge variant="secondary">Docker</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Platform Features</h2>
          <Card className="bg-gradient-card">
            <CardContent className="p-8">
              <div className="grid gap-4 md:grid-cols-2">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center space-x-3"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Impact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-foreground mb-6">Expected Impact</h2>
          <div className="bg-gradient-primary rounded-2xl p-8 shadow-strong">
            <div className="grid gap-8 md:grid-cols-3 text-primary-foreground">
              <div>
                <div className="text-3xl font-bold mb-2">90%</div>
                <div className="text-primary-foreground/80">Reduction in processing time</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">500K+</div>
                <div className="text-primary-foreground/80">Forest community members served</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">4 States</div>
                <div className="text-primary-foreground/80">Initial deployment coverage</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}