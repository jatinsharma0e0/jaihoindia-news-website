import { FileText, Download } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

const documents = [
  {
    title: 'Company Registration Certificate',
    description: 'Official registration certificate of JaiHoIndia News',
    type: 'PDF',
  },
  {
    title: 'Media Credentials',
    description: 'Press and media accreditation documents',
    type: 'PDF',
  },
  {
    title: 'Annual Report 2024',
    description: 'Our annual performance and operations report',
    type: 'PDF',
  },
];

const DocumentsPage = () => {
  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-6">Documents</h1>
          <div className="section-divider mb-8" />
          
          <p className="text-muted-foreground mb-8">
            Access our official documents, reports, and company information below.
          </p>
          
          <div className="space-y-4">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:shadow-card transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{doc.title}</h3>
                    <p className="text-sm text-muted-foreground">{doc.description}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  {doc.type}
                </Button>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Note:</strong> Documents are available 
              for viewing and download. For additional documents or inquiries, please 
              contact us.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DocumentsPage;
