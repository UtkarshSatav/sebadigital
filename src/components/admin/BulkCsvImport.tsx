import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, X, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { bulkCreateProducts, calculatePricing, type Product } from '../../services/productService';
import { toast } from 'sonner';

interface BulkCsvImportProps {
    isOpen: boolean;
    onClose: () => void;
    onImportComplete: () => void;
}

interface ParsedRow {
    title: string;
    description: string;
    sku: string;
    categorySlug: string;
    brandName: string;
    sellingPrice: number;
    originalPrice: number;
    image: string;
    stockQuantity: number;
    badge: string;
}

const EXPECTED_HEADERS = [
    'title', 'description', 'sku', 'categorySlug', 'brandName',
    'sellingPrice', 'originalPrice', 'image', 'stockQuantity', 'badge',
];

function parseCSV(csvText: string): { rows: ParsedRow[]; errors: string[] } {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return { rows: [], errors: ['CSV must have a header row and at least one data row.'] };

    const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const errors: string[] = [];

    // Map header names to indices (case-insensitive, flexible matching)
    const headerMap: Record<string, number> = {};
    const headerAliases: Record<string, string[]> = {
        title: ['title', 'product title', 'product name', 'name', 'product_title', 'product_name'],
        description: ['description', 'desc', 'product description', 'product_description'],
        sku: ['sku', 'product sku', 'product_sku', 'item code', 'item_code'],
        categorySlug: ['categoryslug', 'category', 'category slug', 'category_slug', 'cat'],
        brandName: ['brandname', 'brand', 'brand name', 'brand_name', 'manufacturer'],
        sellingPrice: ['sellingprice', 'selling price', 'selling_price', 'price', 'sale price', 'sale_price'],
        originalPrice: ['originalprice', 'original price', 'original_price', 'rrp', 'msrp', 'was price', 'was_price'],
        image: ['image', 'image url', 'image_url', 'imageurl', 'photo', 'picture', 'img'],
        stockQuantity: ['stockquantity', 'stock quantity', 'stock_quantity', 'stock', 'qty', 'quantity'],
        badge: ['badge', 'label', 'tag'],
    };

    for (const [field, aliases] of Object.entries(headerAliases)) {
        const idx = rawHeaders.findIndex(h => aliases.includes(h.toLowerCase()));
        if (idx !== -1) headerMap[field] = idx;
    }

    // Check required fields
    if (headerMap['title'] === undefined) errors.push('Missing required column: title');
    if (headerMap['sellingPrice'] === undefined) errors.push('Missing required column: sellingPrice (or price)');

    if (errors.length > 0) {
        return { rows: [], errors };
    }

    const rows: ParsedRow[] = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Handle quoted CSV fields
        const cols = parseCSVLine(line);
        const title = cols[headerMap['title']]?.trim() || '';
        if (!title) {
            errors.push(`Row ${i + 1}: Missing title, skipped`);
            continue;
        }

        const sellingPrice = parseFloat(cols[headerMap['sellingPrice']] || '0');
        if (isNaN(sellingPrice) || sellingPrice <= 0) {
            errors.push(`Row ${i + 1}: Invalid price for "${title}", skipped`);
            continue;
        }

        rows.push({
            title,
            description: headerMap['description'] !== undefined ? cols[headerMap['description']]?.trim() || '' : '',
            sku: headerMap['sku'] !== undefined ? cols[headerMap['sku']]?.trim() || '' : '',
            categorySlug: headerMap['categorySlug'] !== undefined ? cols[headerMap['categorySlug']]?.trim() || 'accessories' : 'accessories',
            brandName: headerMap['brandName'] !== undefined ? cols[headerMap['brandName']]?.trim() || 'Generic' : 'Generic',
            sellingPrice,
            originalPrice: headerMap['originalPrice'] !== undefined ? parseFloat(cols[headerMap['originalPrice']] || '0') || sellingPrice : sellingPrice,
            image: headerMap['image'] !== undefined ? cols[headerMap['image']]?.trim() || '' : '',
            stockQuantity: headerMap['stockQuantity'] !== undefined ? parseInt(cols[headerMap['stockQuantity']] || '50') || 50 : 50,
            badge: headerMap['badge'] !== undefined ? cols[headerMap['badge']]?.trim() || '' : '',
        });
    }

    return { rows, errors };
}

function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += ch;
        }
    }
    result.push(current.trim());
    return result;
}

function downloadTemplate() {
    const csv = `title,description,sku,categorySlug,brandName,sellingPrice,originalPrice,image,stockQuantity,badge
"Sony WH-1000XM5","Premium wireless headphones","SEB-WH1000",headphones,Sony,279.99,349.99,https://example.com/img.jpg,25,HOT
"JVC HA-S31M","Lightweight on-ear headphones","SEB-HAS31",headphones,JVC,14.99,19.99,,100,SALE`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'seba_products_template.csv';
    a.click();
    URL.revokeObjectURL(url);
}

export function BulkCsvImport({ isOpen, onClose, onImportComplete }: BulkCsvImportProps) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
    const [parseErrors, setParseErrors] = useState<string[]>([]);
    const [importing, setImporting] = useState(false);
    const [fileName, setFileName] = useState('');
    const [step, setStep] = useState<'upload' | 'preview'>('upload');

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const { rows, errors } = parseCSV(text);
            setParsedRows(rows);
            setParseErrors(errors);
            setStep('preview');
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        if (parsedRows.length === 0) return;

        try {
            setImporting(true);
            const products: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] = parsedRows.map((row) => {
                const pricing = calculatePricing(row.originalPrice, row.sellingPrice, 0.2);
                return {
                    title: row.title,
                    description: row.description || `Premium ${row.title} from Seba Digital.`,
                    sku: row.sku || `SEB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5)}`,
                    categoryId: '',
                    categorySlug: row.categorySlug,
                    brandId: '',
                    brandName: row.brandName,
                    pricing,
                    image: row.image || '/placeholder.jpg',
                    gallery: row.image ? [row.image] : [],
                    rating: 4.5,
                    reviewCount: 0,
                    stock: {
                        quantity: row.stockQuantity,
                        status: row.stockQuantity > 10 ? 'in_stock' as const : row.stockQuantity > 0 ? 'low_stock' as const : 'out_of_stock' as const,
                        lowStockThreshold: 5,
                    },
                    flags: {
                        isFeatured: false,
                        isBestSeller: row.badge === 'BEST SELLER',
                        isNewArrival: row.badge === 'NEW',
                        isOnSale: row.badge === 'SALE',
                        isPopular: row.badge === 'HOT',
                    },
                    badge: row.badge || null,
                    promotionIds: [],
                    isActive: true,
                };
            });

            // Batch in groups of 500 (Firestore limit)
            for (let i = 0; i < products.length; i += 450) {
                const batch = products.slice(i, i + 450);
                await bulkCreateProducts(batch);
            }

            toast.success(`${products.length} products imported!`);
            resetState();
            onImportComplete();
            onClose();
        } catch (err: any) {
            toast.error('Import failed', { description: err.message });
        } finally {
            setImporting(false);
        }
    };

    const resetState = () => {
        setParsedRows([]);
        setParseErrors([]);
        setFileName('');
        setStep('upload');
        if (fileRef.current) fileRef.current.value = '';
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white z-50 shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-green-600" />
                        <h2 className="text-lg font-bold text-gray-900">Bulk CSV Import</h2>
                    </div>
                    <button onClick={() => { resetState(); onClose(); }} className="p-2 hover:bg-gray-200 rounded-lg"><X className="w-5 h-5" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {step === 'upload' ? (
                        <>
                            {/* Instructions */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-2">CSV Format</h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    Upload a CSV file with product data. Only <strong>title</strong> and <strong>sellingPrice</strong> (or <strong>price</strong>) are required. All other columns are optional.
                                </p>
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">Supported Columns</p>
                                    <div className="flex flex-wrap gap-2">
                                        {EXPECTED_HEADERS.map((h) => (
                                            <span key={h} className={`px-2 py-1 rounded text-xs font-mono ${h === 'title' || h === 'sellingPrice' ? 'bg-blue-100 text-blue-700 font-bold' : 'bg-gray-200 text-gray-700'
                                                }`}>{h}</span>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={downloadTemplate}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                >
                                    <Download className="w-4 h-4" />
                                    Download CSV Template
                                </button>
                            </div>

                            {/* Drop Zone */}
                            <div
                                onClick={() => fileRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"
                            >
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-700 font-medium">Click to upload CSV file</p>
                                <p className="text-gray-400 text-sm mt-1">or drag and drop</p>
                                <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Preview */}
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900">Preview: {fileName}</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        <span className="text-green-600 font-medium">{parsedRows.length} products</span> ready to import
                                        {parseErrors.length > 0 && (
                                            <span className="text-amber-600 ml-2">• {parseErrors.length} warning(s)</span>
                                        )}
                                    </p>
                                </div>
                                <button onClick={resetState} className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                                    Upload different file
                                </button>
                            </div>

                            {/* Errors */}
                            {parseErrors.length > 0 && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="w-4 h-4 text-amber-600" />
                                        <span className="text-sm font-medium text-amber-800">Warnings</span>
                                    </div>
                                    <ul className="space-y-1">
                                        {parseErrors.map((err, i) => (
                                            <li key={i} className="text-xs text-amber-700">• {err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Preview Table */}
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <div className="overflow-x-auto max-h-96">
                                    <table className="w-full text-sm">
                                        <thead className="sticky top-0">
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">#</th>
                                                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Title</th>
                                                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Category</th>
                                                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Brand</th>
                                                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Price</th>
                                                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Stock</th>
                                                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Badge</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {parsedRows.map((row, i) => (
                                                <tr key={i} className="hover:bg-gray-50">
                                                    <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                                                    <td className="px-3 py-2 font-medium text-gray-900 max-w-[200px] truncate">{row.title}</td>
                                                    <td className="px-3 py-2 text-gray-600 capitalize">{row.categorySlug}</td>
                                                    <td className="px-3 py-2 text-gray-600">{row.brandName}</td>
                                                    <td className="px-3 py-2 font-semibold text-gray-900">£{row.sellingPrice.toFixed(2)}</td>
                                                    <td className="px-3 py-2 text-gray-600">{row.stockQuantity}</td>
                                                    <td className="px-3 py-2">
                                                        {row.badge ? (
                                                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{row.badge}</span>
                                                        ) : (
                                                            <span className="text-gray-400">—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                {step === 'preview' && parsedRows.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle2 className="w-4 h-4" />
                            {parsedRows.length} products validated
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => { resetState(); onClose(); }} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100">
                                Cancel
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={importing}
                                className="px-5 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg flex items-center gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                {importing ? 'Importing...' : `Import ${parsedRows.length} Products`}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
