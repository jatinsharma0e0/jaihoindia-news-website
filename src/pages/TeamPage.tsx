import { useState } from 'react';
import { X, Linkedin, Twitter, Mail } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

const teamMembers = [
  {
    name: 'Rajesh Kumar',
    role: 'Editor-in-Chief',
    bio: 'With over 20 years of experience in journalism, Rajesh leads our editorial team with a commitment to truth and accuracy.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300',
  },
  {
    name: 'Priya Sharma',
    role: 'Managing Editor',
    bio: 'Priya oversees day-to-day operations and ensures our content meets the highest standards of journalism.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
  },
  {
    name: 'Amit Patel',
    role: 'Technology Director',
    bio: 'Amit leads our technology initiatives, ensuring our platform delivers news efficiently to millions of readers.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
  },
  {
    name: 'Meera Reddy',
    role: 'Political Correspondent',
    bio: 'Meera brings insightful analysis and comprehensive coverage of national and international politics.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300',
  },
  {
    name: 'Vikram Singh',
    role: 'Sports Editor',
    bio: 'A former athlete, Vikram brings passion and expertise to our sports coverage.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
  },
  {
    name: 'Anita Desai',
    role: 'Features Writer',
    bio: 'Anita crafts compelling human interest stories that resonate with our diverse readership.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300',
  },
];

const TeamPage = () => {
  const [selectedMember, setSelectedMember] = useState<typeof teamMembers[0] | null>(null);

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold text-foreground mb-6">Our Team</h1>
        <div className="section-divider mb-8" />
        
        <p className="text-muted-foreground mb-8 max-w-2xl">
          Meet the dedicated professionals behind JaiHoIndia News. Our team brings 
          together expertise from journalism, technology, and media to deliver 
          quality news to our readers.
        </p>
        
        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              onClick={() => setSelectedMember(member)}
              className="news-card bg-card border border-border rounded-lg overflow-hidden cursor-pointer"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-bold text-foreground">{member.name}</h3>
                <p className="text-sm text-primary">{member.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-card rounded-lg shadow-elevated max-w-md w-full overflow-hidden">
              <div className="relative">
                <img
                  src={selectedMember.image}
                  alt={selectedMember.name}
                  className="w-full h-64 object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedMember(null)}
                  className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold text-foreground">{selectedMember.name}</h2>
                <p className="text-primary font-medium mb-4">{selectedMember.role}</p>
                <p className="text-muted-foreground mb-6">{selectedMember.bio}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TeamPage;
