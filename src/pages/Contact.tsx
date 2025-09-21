import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Users, HeadphonesIcon } from "lucide-react";

export default function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for your message! We'll get back to you within 24 hours.");
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      details: "support@fraatlas.gov.in",
      description: "Send us an email anytime"
    },
    {
      icon: Phone,
      title: "Phone",
      details: "+91 11 2345 6789",
      description: "Mon-Fri from 9am to 6pm"
    },
    {
      icon: MapPin,
      title: "Office",
      details: "New Delhi, India",
      description: "Ministry of Tribal Affairs"
    },
    {
      icon: Clock,
      title: "Response Time",
      details: "< 24 hours",
      description: "Average response time"
    }
  ];

  const supportTypes = [
    {
      icon: MessageSquare,
      title: "General Inquiry",
      description: "Questions about FRA Atlas platform and features"
    },
    {
      icon: HeadphonesIcon,
      title: "Technical Support",
      description: "Help with using the platform or technical issues"
    },
    {
      icon: Users,
      title: "Partnership",
      description: "Collaboration opportunities and partnerships"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground">Contact Us</h1>
            <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
              Get in touch with our team for support, partnerships, or general inquiries about the FRA Atlas platform.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Information */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">Get in Touch</h2>
              <p className="text-muted-foreground mb-8">
                We're here to help you with any questions about the FRA Atlas platform. 
                Whether you need technical support, want to explore partnership opportunities, 
                or have general inquiries, our team is ready to assist.
              </p>
            </motion.div>

            {/* Contact Info Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <motion.div
                    key={info.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Card className="hover:shadow-soft transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{info.title}</h3>
                            <p className="text-foreground mt-1">{info.details}</p>
                            <p className="text-sm text-muted-foreground">{info.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Support Types */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-xl font-semibold text-foreground mb-4">How can we help?</h3>
              <div className="space-y-4">
                {supportTypes.map((type, index) => {
                  const Icon = type.icon;
                  return (
                    <div key={type.title} className="flex items-start space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                        <Icon className="h-4 w-4 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{type.title}</h4>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-card shadow-medium">
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="Enter your first name"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter your last name"
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="organization">Organization (Optional)</Label>
                    <Input
                      id="organization"
                      placeholder="Your organization or agency"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="inquiryType">Type of Inquiry</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select inquiry type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Brief subject of your message"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Please provide details about your inquiry..."
                      required
                      className="mt-1 min-h-[120px]"
                    />
                  </div>

                  <Button type="submit" className="w-full" variant="hero" size="lg">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <Card className="bg-gradient-primary">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-primary-foreground mb-4">
                Frequently Asked Questions
              </h3>
              <p className="text-primary-foreground/80 mb-6">
                Visit our FAQ section for quick answers to common questions about the FRA Atlas platform.
              </p>
              <Button variant="secondary" size="lg">
                View FAQ
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}