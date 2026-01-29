import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Image as ImageIcon } from 'lucide-react';
import { getServices, createService, updateService, deleteService, getCategories } from '../../api';
import type { Service, Category } from '../../types';

export default function ServicesManager() {
    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        durationMin: '',
        deposit: '',
        removalPriceOwn: '',
        removalPriceForeign: '',
        categoryId: '',
        categoryName: '', // For new category
        imageUrl: '', // kept for compatibility/single view
        images: [] as string[] // For multi-image
    });

    // UI State for "New Category"
    const [isNewCategory, setIsNewCategory] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [servicesData, categoriesData] = await Promise.all([
                getServices(),
                getCategories()
            ]);
            setServices(servicesData);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (service?: Service) => {
        if (service) {
            setEditingService(service);
            setFormData({
                name: service.name,
                description: service.description || '',
                price: service.price.toString(),
                durationMin: service.durationMin.toString(),
                deposit: (service.deposit || 0).toString(),
                removalPriceOwn: (service.removalPriceOwn || 0).toString(),
                removalPriceForeign: (service.removalPriceForeign || 0).toString(),
                categoryId: service.categoryId,
                categoryName: '',
                imageUrl: service.imageUrl || '',
                images: service.images || (service.imageUrl ? [service.imageUrl] : [])
            });
            setIsNewCategory(false);
        } else {
            setEditingService(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                durationMin: '',
                deposit: '',
                removalPriceOwn: '',
                removalPriceForeign: '',
                categoryId: categories.length > 0 ? categories[0].id : '',
                categoryName: '',
                imageUrl: '',
                images: []
            });
            setIsNewCategory(categories.length === 0);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingService(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Ensure imageUrl is set to first image if available, for backward compat
            const mainImage = formData.images.length > 0 ? formData.images[0] : '';

            const payload = {
                ...formData,
                price: Number(formData.price),
                durationMin: Number(formData.durationMin),
                deposit: Number(formData.deposit),
                removalPriceOwn: Number(formData.removalPriceOwn),
                removalPriceForeign: Number(formData.removalPriceForeign),
                categoryId: isNewCategory ? undefined : formData.categoryId,
                categoryName: isNewCategory ? formData.categoryName : undefined,
                imageUrl: mainImage,
                images: formData.images
            };

            if (editingService) {
                await updateService(editingService.id, payload);
            } else {
                await createService(payload);
            }

            handleCloseModal();
            loadData();
        } catch (error) {
            console.error('Error saving service:', error);
            alert('Error al guardar el servicio');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Estás segura de eliminar este servicio?')) return;
        try {
            await deleteService(id);
            loadData();
        } catch (error) {
            console.error('Error deleting service:', error);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            // Process all selected files
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                        setFormData(prev => ({
                            ...prev,
                            images: [...prev.images, reader.result as string].slice(0, 5) // Limit to 5 images
                        }));
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, idx) => idx !== indexToRemove)
        }));
    };

    // Helper to get category name
    const getCategoryName = (catId: string) => {
        const cat = categories.find(c => c.id === catId);
        return cat ? cat.name : 'Desconocida';
    };

    return (
        <div className="relative">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Servicios</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 font-medium"
                    aria-label="Crear nuevo servicio"
                >
                    <Plus size={20} />
                    Nuevo Servicio
                </button>
            </div>

            <div className="space-y-8">
                {categories.map(category => {
                    const categoryServices = services.filter(s => s.categoryId === category.id);
                    if (categoryServices.length === 0) return null;

                    return (
                        <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
                                <h3 className="text-lg font-bold text-gray-800">{category.name}</h3>
                            </div>
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold text-gray-600 text-sm">Nombre</th>
                                        <th className="px-6 py-3 font-semibold text-gray-600 text-sm">Duración</th>
                                        <th className="px-6 py-3 font-semibold text-gray-600 text-sm">Precio</th>
                                        <th className="px-6 py-3 font-semibold text-gray-600 text-sm text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {categoryServices.map((service) => (
                                        <tr key={service.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border shrink-0">
                                                    {service.images && service.images.length > 0 ? (
                                                        <img src={service.images[0]} alt={service.name} className="w-full h-full object-cover" />
                                                    ) : service.imageUrl ? (
                                                        <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <ImageIcon size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span>{service.name}</span>
                                                    {service.images && service.images.length > 1 && (
                                                        <span className="text-xs text-primary font-medium">{service.images.length} fotos</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">{service.durationMin} min</td>
                                            <td className="px-6 py-4 font-medium text-gray-900">${service.price}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenModal(service)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        aria-label={`Editar servicio ${service.name}`}
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(service.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        aria-label={`Eliminar servicio ${service.name}`}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                })}

                {/* Servicios sin categoría o huérfanos */}
                {(() => {
                    const orphanServices = services.filter(s => !categories.find(c => c.id === s.categoryId));
                    if (orphanServices.length === 0) return null;

                    return (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8 border-l-4 border-l-yellow-400">
                            <div className="bg-yellow-50 border-b border-yellow-100 px-6 py-3">
                                <h3 className="text-lg font-bold text-yellow-800">Sin Categoría / Otros</h3>
                            </div>
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold text-gray-600 text-sm">Nombre</th>
                                        <th className="px-6 py-3 font-semibold text-gray-600 text-sm">Duración</th>
                                        <th className="px-6 py-3 font-semibold text-gray-600 text-sm">Precio</th>
                                        <th className="px-6 py-3 font-semibold text-gray-600 text-sm text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orphanServices.map((service) => (
                                        <tr key={service.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border shrink-0">
                                                    {service.images && service.images.length > 0 ? (
                                                        <img src={service.images[0]} alt={service.name} className="w-full h-full object-cover" />
                                                    ) : service.imageUrl ? (
                                                        <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <ImageIcon size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span>{service.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">{service.durationMin} min</td>
                                            <td className="px-6 py-4 font-medium text-gray-900">${service.price}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenModal(service)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(service.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                })()}

                {services.length === 0 && !loading && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
                        No hay servicios cargados.
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
                            <h3 className="text-xl font-bold text-gray-800">
                                {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600" aria-label="Cerrar modal">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    required
                                    aria-label="Nombre del servicio"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            required
                                            aria-label="Precio del servicio"
                                            className="w-full p-2 pl-7 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                            value={formData.price}
                                            onChange={e => {
                                                const newPrice = e.target.value;
                                                const depositValue = newPrice ? (Number(newPrice) / 2).toString() : '';
                                                setFormData({ ...formData, price: newPrice, deposit: depositValue });
                                            }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
                                    <input
                                        type="number"
                                        required
                                        aria-label="Duración en minutos"
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                        value={formData.durationMin}
                                        onChange={e => setFormData({ ...formData, durationMin: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Seña</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            className="w-full p-2 pl-7 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                            value={formData.deposit}
                                            onChange={e => setFormData({ ...formData, deposit: e.target.value })}
                                            placeholder="0"
                                            aria-label="Monto de seña"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Retiro (Propio)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            className="w-full p-2 pl-7 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                            value={formData.removalPriceOwn}
                                            onChange={e => setFormData({ ...formData, removalPriceOwn: e.target.value })}
                                            placeholder="0"
                                            aria-label="Precio retiro propio"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Retiro (Ajeno)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            className="w-full p-2 pl-7 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                            value={formData.removalPriceForeign}
                                            onChange={e => setFormData({ ...formData, removalPriceForeign: e.target.value })}
                                            placeholder="0"
                                            aria-label="Precio retiro ajeno"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                <select
                                    aria-label="Seleccionar categoría"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none mb-2"
                                    value={isNewCategory ? 'NEW' : formData.categoryId}
                                    onChange={(e) => {
                                        if (e.target.value === 'NEW') {
                                            setIsNewCategory(true);
                                            setFormData(prev => ({ ...prev, categoryId: '', categoryName: '' }));
                                        } else {
                                            setIsNewCategory(false);
                                            setFormData(prev => ({ ...prev, categoryId: e.target.value, categoryName: '' }));
                                        }
                                    }}
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                    <option value="NEW">+ Nueva Categoría...</option>
                                </select>

                                {isNewCategory && (
                                    <input
                                        type="text"
                                        aria-label="Nombre de la nueva categoría"
                                        placeholder="Nombre de la nueva categoría"
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-blue-50"
                                        value={formData.categoryName}
                                        onChange={e => setFormData({ ...formData, categoryName: e.target.value })}
                                        autoFocus
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes (Máx 5)</label>
                                <div className="grid grid-cols-5 gap-2 mb-2">
                                    {formData.images.map((img, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                                            <img src={img} alt={`img-${index}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl hover:bg-red-600 transition-colors"
                                                aria-label="Eliminar imagen"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.images.length < 5 && (
                                        <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors aspect-square">
                                            <Plus size={20} className="text-gray-400" />
                                            <span className="text-[10px] text-gray-500 mt-1">Agregar</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                onChange={handleImageUpload}
                                            />
                                        </label>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400">La primera imagen será la principal.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
                                <textarea
                                    aria-label="Descripción del servicio"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:opacity-90 flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
