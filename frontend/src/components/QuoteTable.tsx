import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export interface QuoteItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface QuoteTableProps {
  items: QuoteItem[];
  onDeleteItem: (id: string) => void;
  onAddItem: () => void;
}

const QuoteTable = ({ items, onDeleteItem, onAddItem }: QuoteTableProps) => {
  return (
    <Paper elevation={3} sx={{ mb: 3 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product Name</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Unit Price</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.productName}</TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">${item.unitPrice.toFixed(2)}</TableCell>
                <TableCell align="right">${item.total.toFixed(2)}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => onDeleteItem(item.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <IconButton onClick={onAddItem} color="primary" sx={{ m: 1 }}>
        <AddIcon />
      </IconButton>
    </Paper>
  );
};

export default QuoteTable;
