import React from 'react';

const Table = ({ columns, data, rowKey = 'id', className = '' }) => {
  return (
    <div className="table-wrapper">
    <table className={`table ${className}`}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} className={col.headerClassName ?? ''}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={row[rowKey] ?? rowIndex}>
            {columns.map((col) => (
              <td
                key={col.key}
                data-label={col.label}
                className={[
                  col.key === 'actions' ? 'table-actions whitespace-nowrap' : '',
                  col.cellClassName ?? '',
                ].filter(Boolean).join(' ') || undefined}
              >
                {col.key === 'actions' && col.render ? (() => {
                  const content = col.render(row);
                  const children = React.Children.toArray(content);
                  const spacer = <span key="actions-spacer" style={{ width: 12, minWidth: 12, display: 'inline-block' }} aria-hidden />;
                  const withSpacer = children.length >= 2
                    ? [children[0], spacer, ...children.slice(1)]
                    : content;
                  return (
                    <>
                      <span className="table-actions-label" aria-hidden>{col.label}</span>
                      <span className="table-actions-inner" style={{ display: 'inline-flex', alignItems: 'center' }}>
                        {withSpacer}
                      </span>
                    </>
                  );
                })() : (
                  <span className="table-cell-value">
                    {col.render ? col.render(row) : row[col.key]}
                  </span>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
};

export default Table;
