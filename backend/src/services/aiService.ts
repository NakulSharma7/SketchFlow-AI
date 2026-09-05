import { GoogleGenerativeAI } from '@google/generative-ai';

export interface CanvasElement {
  id: string;
  kind: 'draw' | 'rectangle' | 'ellipse' | 'diamond' | 'arrow' | 'text';
  start: { x: number; y: number };
  end: { x: number; y: number };
  points?: { x: number; y: number }[];
  color: string;
  width: number;
  text?: string;
  fontSize?: number;
}

export class AiService {
  static async generateDiagram(prompt: string): Promise<CanvasElement[]> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const systemInstruction = `
You are an expert software architect and visual diagram generator for whiteboards.
When given a user prompt, generate a structured array of whiteboard elements (flowcharts, architecture, diagrams).

Each element MUST follow this schema:
{
  "kind": "rectangle" | "diamond" | "arrow" | "text" | "ellipse",
  "start": {"x": number, "y": number},
  "end": {"x": number, "y": number},
  "color": string (e.g. "#2563eb", "#059669", "#dc2626", "#d97706", "#1e293b"),
  "width": number (default 2),
  "text"?: string (label for the box, decision, or connector)
}

Layout rules:
- Canvas is centered around x=600, y=300.
- Vertical step distance: 100-140px. Horizontal step distance: 200px.
- Connect steps with "arrow" elements starting at the bottom of a step and ending at the top of the next step.
- Use "rectangle" for process steps/actions.
- Use "diamond" for decision nodes (e.g. "Valid password?").
- Include a "text" element inside or next to shapes when labeling.
- Return ONLY valid JSON array with NO markdown formatting or backticks.
`;

        const result = await model.generateContent(`${systemInstruction}\n\nUser Prompt: ${prompt}`);
        const response = await result.response;
        const textResponse = response.text();
        const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        if (cleanJson) {
          const rawElements = JSON.parse(cleanJson);
          if (Array.isArray(rawElements) && rawElements.length > 0) {
            return rawElements.map((el, index) => ({
              id: `ai-${Date.now()}-${index}`,
              kind: el.kind || 'rectangle',
              start: el.start || { x: 400, y: 100 + index * 100 },
              end: el.end || { x: 600, y: 160 + index * 100 },
              color: el.color || '#2563eb',
              width: el.width || 2,
              text: el.text || '',
              fontSize: el.fontSize || 14
            }));
          }
        }
      } catch (error) {
        console.warn('Gemini API call warning, relying on intelligent fallback engine:', error);
      }
    }

    // Intelligent Fallback Diagram Generator for offline/unconfigured environments
    return this.generateFallbackDiagram(prompt);
  }

  private static generateFallbackDiagram(prompt: string): CanvasElement[] {
    const p = prompt.toLowerCase();
    const elements: CanvasElement[] = [];
    const timestamp = Date.now();

    if (p.includes('login') || p.includes('auth') || p.includes('signup')) {
      // Flowchart for Authentication Flow
      const steps = [
        { label: 'User enters Email & Password', kind: 'rectangle' as const, color: '#2563eb' },
        { label: 'POST /auth/login', kind: 'rectangle' as const, color: '#4f46e5' },
        { label: 'Verify User & Password Hash?', kind: 'diamond' as const, color: '#d97706' },
        { label: 'Generate JWT & Return 200 OK', kind: 'rectangle' as const, color: '#059669' },
        { label: 'Redirect to Dashboard', kind: 'rectangle' as const, color: '#0284c7' }
      ];

      const startX = 450;
      let startY = 80;
      const boxWidth = 300;
      const boxHeight = 60;
      const gap = 60;

      steps.forEach((step, idx) => {
        const id = `flow-${timestamp}-${idx}`;
        const endY = startY + boxHeight;

        // Shape box
        elements.push({
          id: `${id}-box`,
          kind: step.kind,
          start: { x: startX, y: startY },
          end: { x: startX + boxWidth, y: endY },
          color: step.color,
          width: 2,
          text: step.label,
          fontSize: 14
        });

        // Arrow to next step
        if (idx < steps.length - 1) {
          elements.push({
            id: `${id}-arrow`,
            kind: 'arrow',
            start: { x: startX + boxWidth / 2, y: endY },
            end: { x: startX + boxWidth / 2, y: endY + gap },
            color: '#64748b',
            width: 2
          });
        }

        startY += boxHeight + gap;
      });

      return elements;
    }

    // Default Architecture / Process Flowchart
    const defaultNodes = [
      { text: '1. Frontend (React UI)', x: 150, y: 200, color: '#2563eb' },
      { text: '2. Express API Gateway', x: 480, y: 200, color: '#7c3aed' },
      { text: '3. Controller / Services', x: 810, y: 200, color: '#d97706' },
      { text: '4. Prisma & PostgreSQL', x: 480, y: 400, color: '#059669' }
    ];

    defaultNodes.forEach((node, idx) => {
      elements.push({
        id: `node-${timestamp}-${idx}`,
        kind: 'rectangle',
        start: { x: node.x, y: node.y },
        end: { x: node.x + 240, y: node.y + 70 },
        color: node.color,
        width: 2,
        text: `${node.text}\n(${prompt})`,
        fontSize: 14
      });
    });

    // Connecting arrows
    elements.push(
      {
        id: `arrow-${timestamp}-1`,
        kind: 'arrow',
        start: { x: 390, y: 235 },
        end: { x: 480, y: 235 },
        color: '#64748b',
        width: 2
      },
      {
        id: `arrow-${timestamp}-2`,
        kind: 'arrow',
        start: { x: 720, y: 235 },
        end: { x: 810, y: 235 },
        color: '#64748b',
        width: 2
      },
      {
        id: `arrow-${timestamp}-3`,
        kind: 'arrow',
        start: { x: 600, y: 270 },
        end: { x: 600, y: 400 },
        color: '#64748b',
        width: 2
      }
    );

    return elements;
  }
}
