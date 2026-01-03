package de.bethibande.finance.model.jpa.recurring;

import de.bethibande.finance.model.jpa.transaction.Transaction;
import de.bethibande.finance.model.jpa.transaction.TransactionComponents;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class RecurringPaymentTest {

    public static final Instant NOW = at(2026, 1, 1);

    private static Instant at(final int year, final int month, final int day) {
        return ZonedDateTime.of(year, month, day, 0, 0, 0, 0, ZoneId.systemDefault()).toInstant();
    }

    @Test
    void testUpdatePayments() {
        final RecurringPayment recurring = Mockito.spy(new RecurringPayment());
        recurring.id = 0L;
        recurring.name = "Test";
        recurring.cronSchedule = "0 0 0 1 * *"; // 00:00 @ the first of each month
        recurring.amount = BigDecimal.valueOf(1234);

        final List<Transaction> transactions = recurring.generatePayments(NOW, true);
        //final MockedPayment mock = new MockedPayment(recurring, transactions);

        transactions.getFirst().set(TransactionComponents.USER_MODIFIED, true);

        Mockito.doReturn(transactions).when(recurring).listPendingPayments(NOW);

        final RecurringPayment.PaymentUpdateResult result = recurring.updatePayments(NOW, false);
        assertEquals(11, result.delete().size());
        assertEquals(11, result.create().size());
    }

    @Test
    void testUpdateAllPayments() {
        final RecurringPayment recurring = Mockito.spy(new RecurringPayment());
        recurring.id = 0L;
        recurring.name = "Test";
        recurring.cronSchedule = "0 0 0 1 * *"; // 00:00 @ the first of each month
        recurring.amount = BigDecimal.valueOf(1234);

        final List<Transaction> transactions = recurring.generatePayments(NOW, true);

        Mockito.doReturn(transactions).when(recurring).listPendingPayments(NOW);

        final RecurringPayment.PaymentUpdateResult result = recurring.updatePayments(NOW, false);
        assertEquals(12, result.delete().size());
        assertEquals(12, result.create().size());
    }

    @Test
    void generateNoPaymentsWhenSuspended() {
        final RecurringPayment recurring = new RecurringPayment();
        recurring.id = 0L;
        recurring.name = "Test";
        recurring.cronSchedule = "0 0 0 1 * *"; // 00:00 @ the first of each month
        recurring.amount = BigDecimal.valueOf(1234);
        recurring.status = RecurringPaymentStatus.SUSPENDED;

        final List<Transaction> transactions = recurring.generatePayments(NOW, false);
        assertEquals(0, transactions.size());
    }

    @Test
    void generatePaymentsAfterLastTransactionDate() {
        final RecurringPayment recurring = new RecurringPayment();
        recurring.id = 0L;
        recurring.name = "Test";
        recurring.cronSchedule = "0 0 0 1 * *"; // 00:00 @ the first of each month
        recurring.amount = BigDecimal.valueOf(1234);
        recurring.lastTransactionDate = at(2026, 12, 1);

        final List<Transaction> transactions = recurring.generatePayments(NOW, false);
        assertEquals(1, transactions.size());

        assertEquals(at(2027, 1, 1), transactions.getFirst().date);
    }

    @Test
    void generatePayments() {
        final RecurringPayment recurring = new RecurringPayment();
        recurring.id = 0L;
        recurring.name = "Test";
        recurring.cronSchedule = "0 0 0 1 * *"; // 00:00 @ the first of each month
        recurring.amount = BigDecimal.valueOf(1234);

        final List<Transaction> transactions = recurring.generatePayments(NOW, true);
        assertEquals(12, transactions.size());
        // Starts at 2026-02-01 instead of 2026-01-01 since we only generate payments into the future and the present is not in the future
        assertEquals(at(2026, 2, 1), transactions.get(0).date);
        assertEquals(at(2026, 3, 1), transactions.get(1).date);
        assertEquals(at(2026, 4, 1), transactions.get(2).date);
        assertEquals(at(2026, 5, 1), transactions.get(3).date);
        assertEquals(at(2026, 6, 1), transactions.get(4).date);
        assertEquals(at(2026, 7, 1), transactions.get(5).date);
        assertEquals(at(2026, 8, 1), transactions.get(6).date);
        assertEquals(at(2026, 9, 1), transactions.get(7).date);
        assertEquals(at(2026, 10, 1), transactions.get(8).date);
        assertEquals(at(2026, 11, 1), transactions.get(9).date);
        assertEquals(at(2026, 12, 1), transactions.get(10).date);
        assertEquals(at(2027, 1, 1), transactions.get(11).date);

        assertEquals(at(2027, 1, 1), recurring.lastTransactionDate);
    }

    @Test
    void generatePaymentsNotBefore() {
        final RecurringPayment recurring = new RecurringPayment();
        recurring.id = 0L;
        recurring.name = "Test";
        recurring.cronSchedule = "0 0 0 1 * *"; // 00:00 @ the first of each month
        recurring.notBefore = at(2026, 5, 1);
        recurring.amount = BigDecimal.valueOf(1234);

        final List<Transaction> transactions = recurring.generatePayments(NOW, false);
        assertEquals(9, transactions.size());
        assertEquals(at(2026, 5, 1), transactions.get(0).date);
        assertEquals(at(2026, 6, 1), transactions.get(1).date);
        assertEquals(at(2026, 7, 1), transactions.get(2).date);
        assertEquals(at(2026, 8, 1), transactions.get(3).date);
        assertEquals(at(2026, 9, 1), transactions.get(4).date);
        assertEquals(at(2026, 10, 1), transactions.get(5).date);
        assertEquals(at(2026, 11, 1), transactions.get(6).date);
        assertEquals(at(2026, 12, 1), transactions.get(7).date);
        assertEquals(at(2027, 1, 1), transactions.get(8).date);
    }

    @Test
    void generatePaymentsNotAfter() {
        final RecurringPayment recurring = new RecurringPayment();
        recurring.id = 0L;
        recurring.name = "Test";
        recurring.cronSchedule = "0 0 0 1 * *"; // 00:00 @ the first of each month
        recurring.notAfter = at(2026, 6, 1);
        recurring.amount = BigDecimal.valueOf(1234);

        final List<Transaction> transactions = recurring.generatePayments(NOW, false);
        assertEquals(5, transactions.size());
        assertEquals(at(2026, 2, 1), transactions.get(0).date);
        assertEquals(at(2026, 3, 1), transactions.get(1).date);
        assertEquals(at(2026, 4, 1), transactions.get(2).date);
        assertEquals(at(2026, 5, 1), transactions.get(3).date);
        assertEquals(at(2026, 6, 1), transactions.get(4).date);
    }
}