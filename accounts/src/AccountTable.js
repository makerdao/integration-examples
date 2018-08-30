import React from 'react';

const AccountTable = ({ accounts, currentAccount, useAccount }) => (
  <table>
    <thead>
      <tr>
        <th>name</th>
        <th>type</th>
        <th>address</th>
        <th>ETH balance</th>
        <th>Selected</th>
      </tr>
    </thead>
    <tbody>
      {accounts.map(({ name, address, balance, type }) => (
        <tr key={name}>
          <td>{name}</td>
          <td>{type}</td>
          <td>{address}</td>
          <td>{balance}</td>
          <td className="buttonRow">
            <input
              type="radio"
              checked={name === currentAccount.name}
              onChange={() => useAccount(name)}
            />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default AccountTable;
