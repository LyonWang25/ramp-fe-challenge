import { useCallback, useEffect, useState } from 'react';
import { useCustomFetch } from 'src/hooks/useCustomFetch';
import { SetTransactionApprovalParams, Transaction } from 'src/utils/types';
import { TransactionPane } from './TransactionPane';
import { SetTransactionApprovalFunction, TransactionsComponent } from './types';

export const Transactions: TransactionsComponent = ({
  transactions: initialTransactions,
}) => {
  console.log('initialTransactions', initialTransactions); //initialTransactions (5) [{…}, {…}, {…}, {…}, {…}]
  const { fetchWithoutCache, loading } = useCustomFetch();
  const [transactions, setTransactions] = useState<Transaction[]>(
    initialTransactions as Transaction[]
  );
  useEffect(() => {
    setTransactions(initialTransactions as Transaction[]);
  }, [initialTransactions]);

  const setTransactionApproval = useCallback<SetTransactionApprovalFunction>(
    async ({ transactionId, newValue }) => {
      await fetchWithoutCache<void, SetTransactionApprovalParams>(
        'setTransactionApproval',
        {
          transactionId,
          value: newValue,
        }
      );
      // Update the local state with the new approval status
      setTransactions((prevTransactions) => {
        return prevTransactions.map((transaction) =>
          transaction.id === transactionId
            ? { ...transaction, approved: newValue }
            : transaction
        );
      });
    },
    [fetchWithoutCache]
  );

  if (transactions === null) {
    return <div className="RampLoading--container">Loading...</div>;
  }

  return (
    <div data-testid="transaction-container">
      {transactions ? (
        transactions.map((transaction) => (
          <TransactionPane
            key={transaction.id}
            transaction={transaction}
            loading={loading}
            setTransactionApproval={setTransactionApproval}
          />
        ))
      ) : (
        <div>No transactions available</div>
      )}
    </div>
  );
};
