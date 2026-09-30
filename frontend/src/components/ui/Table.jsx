const Table = ({ columns = [], data = [], emptyMessage = "No data found." }) => {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-slate-800">
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500"
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-4 py-8 text-center text-sm text-slate-500"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row, rowIndex) => (
                            <tr
                                key={row.id || rowIndex}
                                className="border-b border-slate-800/50 last:border-0"
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className="px-4 py-4 text-sm text-slate-300"
                                    >
                                        {column.render
                                            ? column.render(row)
                                            : row[column.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Table;

