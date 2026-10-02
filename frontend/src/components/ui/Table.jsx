const Table = ({
    columns = [],
    data = [],
    emptyMessage = "No data found.",
}) => {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full min-w-full text-left">
                <thead>
                    <tr className="border-b border-slate-800/90">
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500"
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/60">
                    {data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-4 py-10 text-center text-sm text-slate-500"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row, rowIndex) => (
                            <tr
                                key={row.id || rowIndex}
                                className="transition-colors duration-150 hover:bg-slate-800/30"
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