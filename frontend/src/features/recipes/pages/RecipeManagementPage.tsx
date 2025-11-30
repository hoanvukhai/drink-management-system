// frontend/src/features/recipes/pages/RecipeManagementPage.tsx
import { useState, useEffect } from 'react';
import { recipesAPI, productsAPI, Recipe, Product } from '../../../lib/api';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal, ModalFooter } from '../../../components/ui/Modal';
import { Input, Textarea, Select } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BookOpenIcon,
  BeakerIcon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';

interface IngredientForm {
  name: string;
  quantity: string;
  note: string;
}

interface StepForm {
  stepNumber: number;
  instruction: string;
}

export default function RecipeManagementPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  
  // Form state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<IngredientForm[]>([
    { name: '', quantity: '', note: '' }
  ]);
  const [steps, setSteps] = useState<StepForm[]>([
    { stepNumber: 1, instruction: '' }
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [recipesRes, productsRes] = await Promise.all([
        recipesAPI.getAll(),
        productsAPI.getAll(),
      ]);
      setRecipes(recipesRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (recipe?: Recipe) => {
    if (recipe) {
      setEditingRecipe(recipe);
      setSelectedProductId(recipe.productId.toString());
      setDescription(recipe.description || '');
      setIngredients(recipe.ingredients.map(ing => ({
        name: ing.name,
        quantity: ing.quantity,
        note: ing.note || ''
      })));
      setSteps(recipe.steps.map(step => ({
        stepNumber: step.stepNumber,
        instruction: step.instruction
      })));
    } else {
      setEditingRecipe(null);
      setSelectedProductId('');
      setDescription('');
      setIngredients([{ name: '', quantity: '', note: '' }]);
      setSteps([{ stepNumber: 1, instruction: '' }]);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRecipe(null);
  };

  // Ingredient handlers
  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', note: '' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof IngredientForm, value: string) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  // Step handlers
  const addStep = () => {
    setSteps([...steps, { stepNumber: steps.length + 1, instruction: '' }]);
  };

  const removeStep = (index: number) => {
    const updated = steps.filter((_, i) => i !== index);
    // Re-number steps
    updated.forEach((step, i) => {
      step.stepNumber = i + 1;
    });
    setSteps(updated);
  };

  const updateStep = (index: number, instruction: string) => {
    const updated = [...steps];
    updated[index].instruction = instruction;
    setSteps(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProductId) {
      toast.error('Vui lòng chọn sản phẩm');
      return;
    }

    // Validate
    const validIngredients = ingredients.filter(ing => ing.name && ing.quantity);
    const validSteps = steps.filter(step => step.instruction);

    if (validIngredients.length === 0) {
      toast.error('Vui lòng thêm ít nhất 1 nguyên liệu');
      return;
    }

    if (validSteps.length === 0) {
      toast.error('Vui lòng thêm ít nhất 1 bước thực hiện');
      return;
    }

    setIsLoading(true);
    try {
      const data = {
        productId: parseInt(selectedProductId),
        description,
        ingredients: validIngredients,
        steps: validSteps,
      };

      if (editingRecipe) {
        await recipesAPI.update(editingRecipe.id, data);
        toast.success('Cập nhật công thức thành công');
      } else {
        await recipesAPI.create(data);
        toast.success('Thêm công thức thành công');
      }

      await fetchData();
      closeModal();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, productName: string) => {
    if (!confirm(`Xóa công thức "${productName}"?`)) return;

    try {
      await recipesAPI.delete(id);
      toast.success('Xóa công thức thành công');
      await fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Xóa công thức thất bại');
    }
  };

  const productsWithRecipe = recipes.map(r => r.productId);
  const availableProducts = products.filter(p => !productsWithRecipe.includes(p.id));

  if (isLoading && recipes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-6">
        {/* Header */}
        <div className="page-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title flex items-center gap-2">
                <BookOpenIcon className="h-8 w-8 text-orange-600" />
                Quản lý Công thức
              </h1>
              <p className="text-gray-600 mt-2">Quản lý công thức pha chế cho từng món</p>
            </div>
            <Button
              variant="primary"
              onClick={() => openModal()}
              leftIcon={<PlusIcon className="h-5 w-5" />}
            >
              Thêm công thức
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card padding="md">
            <div className="text-center">
              <p className="text-sm text-gray-600">Tổng công thức</p>
              <p className="text-3xl font-bold text-orange-600">{recipes.length}</p>
            </div>
          </Card>
          <Card padding="md">
            <div className="text-center">
              <p className="text-sm text-gray-600">Món chưa có</p>
              <p className="text-3xl font-bold text-gray-900">{availableProducts.length}</p>
            </div>
          </Card>
          <Card padding="md">
            <div className="text-center">
              <p className="text-sm text-gray-600">Tổng món</p>
              <p className="text-3xl font-bold text-indigo-600">{products.length}</p>
            </div>
          </Card>
          <Card padding="md">
            <div className="text-center">
              <p className="text-sm text-gray-600">% Hoàn thành</p>
              <p className="text-3xl font-bold text-green-600">
                {products.length > 0 ? Math.round((recipes.length / products.length) * 100) : 0}%
              </p>
            </div>
          </Card>
        </div>

        {/* Recipes Grid */}
        {recipes.length === 0 ? (
          <Card padding="lg">
            <div className="text-center py-12">
              <BookOpenIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có công thức nào</h3>
              <p className="text-gray-600 mb-4">Bắt đầu bằng cách thêm công thức đầu tiên</p>
              <Button variant="primary" onClick={() => openModal()}>
                <PlusIcon className="h-5 w-5 mr-2" />
                Thêm công thức
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe) => (
              <Card key={recipe.id} padding="none" className="overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <h3 className="font-bold text-lg">{recipe.product.name}</h3>
                  <p className="text-sm opacity-90">{recipe.product.price.toLocaleString()}đ</p>
                </div>

                {/* Body */}
                <div className="p-4">
                  {recipe.description && (
                    <p className="text-sm text-gray-600 mb-3 italic">{recipe.description}</p>
                  )}

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <BeakerIcon className="h-4 w-4 text-orange-600" />
                      <span className="font-medium">{recipe.ingredients.length} nguyên liệu</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <ListBulletIcon className="h-4 w-4 text-orange-600" />
                      <span className="font-medium">{recipe.steps.length} bước</span>
                    </div>
                  </div>

                  {/* Preview ingredients */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Nguyên liệu:</p>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {recipe.ingredients.slice(0, 3).map((ing, idx) => (
                        <p key={idx} className="text-xs text-gray-600">
                          • {ing.name}: <span className="font-semibold">{ing.quantity}</span>
                        </p>
                      ))}
                      {recipe.ingredients.length > 3 && (
                        <p className="text-xs text-gray-500 italic">
                          +{recipe.ingredients.length - 3} nguyên liệu khác...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => openModal(recipe)}
                      leftIcon={<PencilIcon className="h-4 w-4" />}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(recipe.id, recipe.product.name)}
                      leftIcon={<TrashIcon className="h-4 w-4" />}
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recipe Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingRecipe ? 'Sửa công thức' : 'Thêm công thức mới'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Selection */}
          <Select
            label="Chọn sản phẩm *"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            options={[
              { value: '', label: '-- Chọn món --' },
              ...(editingRecipe 
                ? [{ value: editingRecipe.productId.toString(), label: editingRecipe.product.name }]
                : availableProducts.map(p => ({ value: p.id.toString(), label: `${p.name} (${p.price.toLocaleString()}đ)` }))
              ),
            ]}
            required
            disabled={!!editingRecipe}
          />

          {/* Description */}
          <Textarea
            label="Mô tả công thức (tùy chọn)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="VD: Trà sữa truyền thống kiểu Đài Loan..."
            rows={2}
          />

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                Nguyên liệu *
              </label>
              <Button type="button" size="sm" onClick={addIngredient}>
                <PlusIcon className="h-4 w-4 mr-1" />
                Thêm
              </Button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {ingredients.map((ing, index) => (
                <div key={index} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-2">
                    {index + 1}
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input
                      placeholder="Tên nguyên liệu *"
                      value={ing.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      required
                    />
                    <Input
                      placeholder="Định lượng * (VD: 50ml, 30g)"
                      value={ing.quantity}
                      onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                      required
                    />
                    <Input
                      placeholder="Ghi chú (tùy chọn)"
                      value={ing.note}
                      onChange={(e) => updateIngredient(index, 'note', e.target.value)}
                    />
                  </div>
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                Các bước thực hiện *
              </label>
              <Button type="button" size="sm" onClick={addStep}>
                <PlusIcon className="h-4 w-4 mr-1" />
                Thêm bước
              </Button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center font-bold mt-2">
                    {step.stepNumber}
                  </div>
                  <div className="flex-1">
                    <Textarea
                      placeholder={`Bước ${step.stepNumber} *`}
                      value={step.instruction}
                      onChange={(e) => updateStep(index, e.target.value)}
                      rows={2}
                      required
                    />
                  </div>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <ModalFooter>
            <Button type="button" variant="secondary" onClick={closeModal}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              {editingRecipe ? 'Cập nhật' : 'Thêm công thức'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}