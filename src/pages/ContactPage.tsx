import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const ContactPage = () => {
  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-6">Contact Us</h1>
          <div className="section-divider mb-8" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-6">Get in Touch</h2>
              <p className="text-muted-foreground mb-8">
                Have a news tip, feedback, or inquiry? We'd love to hear from you. 
                Reach out using any of the methods below.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Email</h3>
                    <p className="text-muted-foreground">contact@jaihoindianews.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Phone</h3>
                    <p className="text-muted-foreground">+91 98765 43210</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Address</h3>
                    <p className="text-muted-foreground">
                      JaiHoIndia News<br />
                      New Delhi, India
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold text-foreground mb-6">Send a Message</h2>
              <form className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Full Name
                  </label>
                  <Input placeholder="Your name" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Email Address
                  </label>
                  <Input type="email" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Subject
                  </label>
                  <Input placeholder="What's this about?" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Message
                  </label>
                  <Textarea placeholder="Your message..." rows={5} />
                </div>
                <Button type="submit" className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;
