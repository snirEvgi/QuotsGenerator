import { Paper, Typography, Box } from '@mui/material';

interface SummaryProps {
  subtotal: number;
  tax: number;
  total: number;
}

const Summary = ({ subtotal, tax, total }: SummaryProps) => {
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Summary
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography>Subtotal:</Typography>
          <Typography>${subtotal.toFixed(2)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography>Tax (17%):</Typography>
          <Typography>${tax.toFixed(2)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <Typography>Total:</Typography>
          <Typography>${total.toFixed(2)}</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default Summary;
