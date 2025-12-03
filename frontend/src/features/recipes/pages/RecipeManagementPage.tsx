import { useState, useEffect } from 'react';
import { recipesAPI, productsAPI, ingredientsAPI, Recipe, Product, Ingredient } from '../../../lib/api';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal, ModalFooter } from '../../../components/ui/Modal';
import { Input, Textarea, Select } from '../../../components/ui/Input';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BookOpenIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';

interface IngredientForm {
  ingredientId: string; // 🔥 Changed from name
  quantity: string;
}

interface StepForm {
  stepNumber: number;
  instruction: string;
}

export default function RecipeManagementPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]); // 🔥 NEW
  const [isLoading, setIsLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  
  const [selectedProductId, setSelectedProductId] = useState('');
  const [description, setDescription] = useState('');
  const [ingredientForms, setIngredientForms] = useState<IngredientForm[]>([
    { ingredientId: '', quantity: '' }
  ]);
  const [steps, setSteps] = useState<StepForm[]>([
    { stepNumber: 1, instruction: '' }
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [recipesRes, productsRes, ingredientsRes] = await Promise.all([
        recipesAPI.getAll(),
        productsAPI.getAll(),
        ingredientsAPI.getAll(), // 🔥 NEW
      ]);
      setRecipes(recipesRes.data);
      setProducts(productsRes.data);
      setIngredients(ingredientsRes.data); // 🔥 NEW
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
      
      // 🔥 Map ingredients with ingredientId
      setIngredientForms(recipe.ingredients.map(ing => ({
        ingredientId: ing.ingredient.id.toString(),
        quantity: ing.quantity.toString(),
      })));
      
      setSteps(recipe.steps.map(step => ({
        stepNumber: step.stepNumber,
        instruction: step.instruction
      })));
    } else {
      setEditingRecipe(null);
      setSelectedProductId('');
      setDescription('');
      setIngredientForms([{ ingredientId: '', quantity: '' }]);
      setSteps([{ stepNumber: 1, instruction: '' }]);
    }
    setShowModal(true);
  };

  // Ingredient handlers
  const addIngredient = () => {
    setIngredientForms([...ingredientForms, { ingredientId: '', quantity: '' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredientForms(ingredientForms.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof IngredientForm, value: string) => {
    const updated = [...ingredientForms];
    updated[index][field] = value;
    setIngredientForms(updated);
  };

  // Step handlers (unchanged)
  const addStep = () => {
    setSteps([...steps, { stepNumber: steps.length + 1, instruction: '' }]);
  };

  const removeStep = (index: number) => {
    const updated = steps.filter((_, i) => i !== index);
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
    const validIngredients = ingredientForms.filter(ing => ing.ingredientId && ing.quantity);
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
        ingredients: validIngredients.map(ing => ({
          ingredientId: parseInt(ing.ingredientId),
          quantity: parseFloat(ing.quantity),
        })),
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

  const closeModal = () => {
    setShowModal(false);
    setEditingRecipe(null);
  };

  const productsWithRecipe = recipes.map(r => r.productId);
  const availableProducts = products.filter(p => !productsWithRecipe.includes(p.id));

  // 🔥 Get ingredient name helper
  const getIngredientName = (id: number) => {
    return ingredients.find(ing => ing.id === id)?.name || 'Unknown';
  };

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
              <p className="text-gray-600 mt-2">Tạo công thức pha chế với nguyên liệu từ kho</p>
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

        {/* Recipes Grid */}
        {recipes.length === 0 ? (
          <Card padding="lg">
            <div className="text-center py-12">
              <BookOpenIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có công thức nào</h3>
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
                <div className="px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <h3 className="font-bold text-lg">{recipe.product.name}</h3>
                  <p className="text-sm opacity-90">{recipe.product.price.toLocaleString()}đ</p>
                </div>

                <div className="p-4">
                  {recipe.description && (
                    <p className="text-sm text-gray-600 mb-3 italic">{recipe.description}</p>
                  )}

                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Nguyên liệu từ kho:</p>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {recipe.ingredients.slice(0, 3).map((ing, idx) => (
                        <p key={idx} className="text-xs text-gray-600">
                          • {ing.ingredient.name}: <span className="font-semibold">{ing.quantity} {ing.ingredient.unit}</span>
                        </p>
                      ))}
                      {recipe.ingredients.length > 3 && (
                        <p className="text-xs text-gray-500 italic">
                          +{recipe.ingredients.length - 3} nguyên liệu khác...
                        </p>
                      )}
                    </div>
                  </div>

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
                Nguyên liệu từ kho *
              </label>
              <Button type="button" size="sm" onClick={addIngredient}>
                <PlusIcon className="h-4 w-4 mr-1" />
                Thêm
              </Button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {ingredientForms.map((ing, index) => (
                <div key={index} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-2">
                    {index + 1}
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Select
                      label=""
                      value={ing.ingredientId}
                      onChange={(e) => updateIngredient(index, 'ingredientId', e.target.value)}
                      options={[
                        { value: '', label: '-- Chọn nguyên liệu --' },
                        ...ingredients.map(ingredient => ({
                          value: ingredient.id.toString(),
                          label: `${ingredient.name} (${ingredient.unit})`,
                        })),
                      ]}
                      required
                    />
                    <Input
                      placeholder="Định lượng (VD: 0.03)"
                      type="number"
                      step="0.001"
                      value={ing.quantity}
                      onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                      required
                    />
                  </div>
                  {ingredientForms.length > 1 && (
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

          {/* Steps (unchanged) */}
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