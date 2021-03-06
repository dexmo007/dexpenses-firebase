import * as fbTest from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import dataset from '../src/big-query-export/dataset';
import * as mockDate from 'jest-date-mock';

const test = fbTest();

mockDate.advanceTo('2019-01-01T00:00:00.000Z');

jest.spyOn(admin, 'initializeApp');

jest.mock('../src/big-query-export/dataset', () => ({
  default: {
    table: jest.fn().mockReturnValue({
      insert: jest.fn(),
    }),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('BigQueryExport (offline) - receipts', () => {
  it('should create insert', async () => {
    const receiptsToBigQuery = test.wrap(require('../src').receiptsToBigQuery);

    const refPath = 'receiptsByUser/testUserId/receipts/test-recept.jpg';
    const before = test.firestore.makeDocumentSnapshot({}, refPath);
    const after = test.firestore.makeDocumentSnapshot(
      {
        result: {
          data: {
            header: ['header'],
          },
        },
      },
      refPath
    );
    const change = test.makeChange(before, after);
    await receiptsToBigQuery(change, {
      params: {
        userId: 'testUserId',
        receiptId: 'test-receipt.jpg',
      },
    });
    expect(dataset.table).toHaveBeenCalledTimes(1);
    expect(dataset.table).toHaveBeenCalledWith('receipts');
    expect(dataset.table('receipts').insert).toMatchSnapshot();
  });
});

describe('BigQueryExport (offline) - recurringPayments', () => {
  it('should create insert', async () => {
    const recurringPaymentsToBigQuery = test.wrap(
      require('../src').recurringPaymentsToBigQuery
    );

    const refPath =
      'recurringPaymentsByUser/testUserId/recurringPayments/abcdef';
    const before = test.firestore.makeDocumentSnapshot({}, refPath);
    const after = test.firestore.makeDocumentSnapshot(
      {
        name: 'name',
        description: 'description',
        amount: {
          value: 10,
          currency: 'EUR',
        },
        paymentMethod: 'DEBIT',
        period: 'Monthly',
      },
      refPath
    );
    const change = test.makeChange(before, after);
    await recurringPaymentsToBigQuery(change, {
      params: {
        userId: 'testUserId',
        paymentId: 'abcdef',
      },
    });
    expect(dataset.table).toHaveBeenCalledTimes(1);
    expect(dataset.table).toHaveBeenCalledWith('recurring_payments');
    expect(dataset.table('recurring_payments').insert).toMatchSnapshot();
  });
});
