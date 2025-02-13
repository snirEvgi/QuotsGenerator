import { Paper, Typography, TextField, Box } from '@mui/material';

interface CustomSectionProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

const CustomSection = ({ notes, onNotesChange }: CustomSectionProps) => {
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Additional Notes
      </Typography>
      <Box>
        <TextField
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Add any additional notes, verifications, or remarks here..."
        />
      </Box>
    </Paper>
  );
};

export default CustomSection;
