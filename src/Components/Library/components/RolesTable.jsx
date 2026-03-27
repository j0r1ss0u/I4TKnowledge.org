import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../../AuthContext';
import ui from '../../../translations/ui.js';

const RolesTable = ({ rolesRegistry, formatDate }) => {
  const { language } = useAuth();
  const t = (ui[language] || ui.en);
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedRoles = [...rolesRegistry].sort((a, b) => {
    if (!a[sortConfig.key] || !b[sortConfig.key]) return 0;

    let comparison = 0;
    switch (sortConfig.key) {
      case 'createdAt':
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        comparison = dateA - dateB;
        break;
      case 'address':
      case 'role':
      case 'action':
      case 'memberName':
        comparison = a[sortConfig.key].localeCompare(b[sortConfig.key]);
        break;
      default:
        comparison = String(a[sortConfig.key]).localeCompare(String(b[sortConfig.key]));
    }

    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });

  // Helper component for sort indicator
  const SortIndicator = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="inline w-4 h-4" /> : 
      <ChevronDown className="inline w-4 h-4" />;
  };

  // Helper component for column header
  const SortableHeader = ({ label, sortKey }) => (
    <th 
      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIndicator columnKey={sortKey} />
      </div>
    </th>
  );

  return (
    <div className="mt-8 w-full">
      <h3 className="text-lg font-bold mb-4">{t.adminView.rolesRegistry}</h3>
      <div className="w-full overflow-x-auto">
        <table className="w-full table-auto divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader label={t.adminView.memberOrg} sortKey="memberName" />
              <SortableHeader label={t.adminView.walletAddress} sortKey="address" />
              <SortableHeader label="Role" sortKey="role" />
              <SortableHeader label="Action" sortKey="action" />
              <SortableHeader label={t.adminView.date} sortKey="createdAt" />
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.adminView.transaction}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedRoles.map((role) => (
              <tr key={role.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm min-w-[200px]">
                  {role.memberName}
                </td>
                <td className="px-4 py-2 text-sm whitespace-nowrap font-mono">
                  {role.address.slice(0, 6)}...{role.address.slice(-4)}
                </td>
                <td className="px-4 py-2 text-sm whitespace-nowrap">
                  {role.role}
                </td>
                <td className="px-4 py-2 text-sm whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    role.action === 'register' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {role.action}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm whitespace-nowrap text-gray-500">
                  {formatDate(role.createdAt)}
                </td>
                <td className="px-4 py-2 text-sm whitespace-nowrap">
                  {role.transactionHash && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${role.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline font-mono"
                    >
                      {`${role.transactionHash.slice(0, 6)}...${role.transactionHash.slice(-4)}`}
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RolesTable;