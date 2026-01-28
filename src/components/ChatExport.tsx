import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, File, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatExportProps {
  messages: Message[];
  documentContext?: {
    fileName?: string;
    riskScore?: number;
    riskLevel?: string;
  };
}

const ChatExport: React.FC<ChatExportProps> = ({ messages, documentContext }) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportAsText = async () => {
    setIsExporting(true);
    try {
      let content = '='.repeat(60) + '\n';
      content += 'ClauseWise Chat Export\n';
      content += '='.repeat(60) + '\n\n';
      
      content += `Export Date: ${formatTimestamp(new Date())}\n`;
      
      if (documentContext) {
        content += '\n--- Document Context ---\n';
        if (documentContext.fileName) content += `File: ${documentContext.fileName}\n`;
        if (documentContext.riskScore !== undefined) {
          content += `Risk Score: ${documentContext.riskScore}/100 (${documentContext.riskLevel})\n`;
        }
      }
      
      content += '\n' + '='.repeat(60) + '\n';
      content += 'Conversation\n';
      content += '='.repeat(60) + '\n\n';

      messages.forEach((msg) => {
        const sender = msg.isUser ? 'You' : 'ClauseWise AI';
        content += `[${formatTimestamp(msg.timestamp)}] ${sender}:\n`;
        content += msg.content + '\n\n';
        content += '-'.repeat(40) + '\n\n';
      });

      content += '\n' + '='.repeat(60) + '\n';
      content += 'End of Export\n';
      content += '='.repeat(60) + '\n';

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clausewise-chat-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export complete',
        description: 'Chat exported as text file',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Could not export chat',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;
      let yPosition = margin;

      // Title
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ClauseWise Chat Export', margin, yPosition);
      yPosition += 10;

      // Export date
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Exported: ${formatTimestamp(new Date())}`, margin, yPosition);
      yPosition += 8;

      // Document context
      if (documentContext) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Document Context:', margin, yPosition);
        yPosition += 6;
        pdf.setFont('helvetica', 'normal');
        if (documentContext.fileName) {
          pdf.text(`File: ${documentContext.fileName}`, margin + 5, yPosition);
          yPosition += 5;
        }
        if (documentContext.riskScore !== undefined) {
          pdf.text(`Risk Score: ${documentContext.riskScore}/100 (${documentContext.riskLevel})`, margin + 5, yPosition);
          yPosition += 5;
        }
        yPosition += 5;
      }

      // Separator
      pdf.setDrawColor(200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Messages
      messages.forEach((msg) => {
        // Check if we need a new page
        if (yPosition > pdf.internal.pageSize.getHeight() - 40) {
          pdf.addPage();
          yPosition = margin;
        }

        const sender = msg.isUser ? 'You' : 'ClauseWise AI';
        
        // Sender and timestamp
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(msg.isUser ? 0 : 59, msg.isUser ? 102 : 130, msg.isUser ? 204 : 246);
        pdf.text(`${sender} - ${formatTimestamp(msg.timestamp)}`, margin, yPosition);
        yPosition += 5;

        // Message content
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        
        const lines = pdf.splitTextToSize(msg.content, maxWidth);
        lines.forEach((line: string) => {
          if (yPosition > pdf.internal.pageSize.getHeight() - 20) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin, yPosition);
          yPosition += 5;
        });

        yPosition += 8;
      });

      pdf.save(`clausewise-chat-${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: 'Export complete',
        description: 'Chat exported as PDF',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Could not export chat',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (messages.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportAsText}>
          <FileText className="w-4 h-4 mr-2" />
          Export as Text
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsPDF}>
          <File className="w-4 h-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChatExport;
