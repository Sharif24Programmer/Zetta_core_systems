const CategoryChips = ({ categories, selected, onSelect }) => {
    return (
        <div className="flex gap-2 overflow-x-auto py-2 -mx-4 px-4 scrollbar-hide">
            {categories.map(category => (
                <button
                    key={category}
                    onClick={() => onSelect(category)}
                    className={`
            px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
            ${selected === category
                            ? 'bg-primary-500 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }
          `}
                >
                    {category}
                </button>
            ))}
        </div>
    );
};

export default CategoryChips;
