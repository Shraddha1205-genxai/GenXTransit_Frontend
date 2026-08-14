import React from "react";
import { T } from "../../../constants/theme";
import { Card, Th, Td, SectionHeader, Table } from "../../../components/common";

export interface DailyCollectionRecord {
  depot: string;
  declared: number;
  deposited: number;
  discrepancy: number;
}

export interface WalletTransactionRecord {
  ref: string;
  passenger: string;
  type: string;
  amount: number;
}

interface FinanceWalletProps {
  collections: DailyCollectionRecord[];
  walletTxns: WalletTransactionRecord[];
}

export function FinanceWallet({ collections, walletTxns }: FinanceWalletProps) {
  return (
    <div>
      <SectionHeader eyebrow="TBL_TRANS_DAILY_SHIFT_COLLECTION · TBL_TRANS_WALLET_TRANSACTION" title="Finance & wallet" />
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
        <Card title="Cash reconciliation by depot">
          <Table>
            <thead>
              <tr>
                <Th>Depot</Th>
                <Th align="right">Declared</Th>
                <Th align="right">Deposited</Th>
                <Th align="right">Discrepancy</Th>
              </tr>
            </thead>
            <tbody>
              {collections.map((c: DailyCollectionRecord) => (
                <tr key={c.depot} className="stc-row">
                  <Td mono>{c.depot}</Td>
                  <Td align="right" mono>₹{c.declared.toLocaleString("en-IN")}</Td>
                  <Td align="right" mono>₹{c.deposited.toLocaleString("en-IN")}</Td>
                  <Td align="right" mono>
                    <span style={{ color: c.discrepancy < 0 ? T.red : T.green, fontWeight: 600 }}>
                      {c.discrepancy === 0 ? "Matched" : `₹${c.discrepancy.toLocaleString("en-IN")}`}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <Card title="Wallet transactions">
          <Table>
            <thead>
              <tr>
                <Th>Ref</Th>
                <Th>Passenger</Th>
                <Th>Type</Th>
                <Th align="right">Amount</Th>
              </tr>
            </thead>
            <tbody>
              {walletTxns.map((w: WalletTransactionRecord) => (
                <tr key={w.ref} className="stc-row">
                  <Td mono>{w.ref}</Td>
                  <Td>{w.passenger}</Td>
                  <Td>{w.type}</Td>
                  <Td align="right" mono>
                    <span style={{ color: w.amount < 0 ? T.red : T.green, fontWeight: 600 }}>
                      {w.amount < 0 ? "-" : "+"}₹{Math.abs(w.amount)}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
}

export default FinanceWallet;
