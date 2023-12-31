import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { InputSelect } from './components/InputSelect';
import { Instructions } from './components/Instructions';
import { Transactions } from './components/Transactions';
import { useEmployees } from './hooks/useEmployees';
import { usePaginatedTransactions } from './hooks/usePaginatedTransactions';
import { useTransactionsByEmployee } from './hooks/useTransactionsByEmployee';
import { EMPTY_EMPLOYEE } from './utils/constants';
import { Employee } from './utils/types';

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees();
  const {
    hasMore,
    data: paginatedTransactions,
    ...paginatedTransactionsUtils
  } = usePaginatedTransactions();
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } =
    useTransactionsByEmployee();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  const transactions = useMemo(
    () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  );

  const loadAllTransactions = useCallback(async () => {
    setIsLoading(true);
    transactionsByEmployeeUtils.invalidateData();

    if (selectedEmployee) {
      await transactionsByEmployeeUtils.fetchById(selectedEmployee.id);
    } else {
      await employeeUtils.fetchAll();
      await paginatedTransactionsUtils.fetchAll();
    }

    setIsLoading(false);
  }, [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils]);

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      const employee = employees?.find((e) => e.id === employeeId) ?? null;
      setSelectedEmployee(employee);
      paginatedTransactionsUtils.invalidateData();
      await transactionsByEmployeeUtils.fetchById(employeeId);
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  );

  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions();
    }
  }, [employeeUtils.loading, employees, loadAllTransactions]);

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          // Bu5(part 2):already fixed as well
          isLoading={employeeUtils.loading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null) {
              setSelectedEmployee(null);
              return;
            }
            await loadTransactionsByEmployee(newValue.id);
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions transactions={transactions} />

          {transactions !== null && selectedEmployee === null && hasMore && (
            <button
              className="RampButton"
              disabled={paginatedTransactionsUtils.loading}
              onClick={async () => {
                await loadAllTransactions();
              }}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  );
}
