"use client";

import React, { useState } from "react";
import { Product } from "../types";
import { X, Plus, Minus, Check, Flame, Clock } from "lucide-react";

interface ProductDetailModalProps {
  product: Product;
  currency: string;
  primaryColor: string;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    modifiers?: { modifierName: string; optionName: string; price: number }[],
    notes?: string
  ) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currency,
  primaryColor,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<
    Record<string, { optionName: string; price: number }>
  >({});
  const [notes, setNotes] = useState("");

  // Initialize required modifiers with their first option
  React.useEffect(() => {
    if (product.modifiers) {
      const initial: Record<string, { optionName: string; price: number }> = {};
      product.modifiers.forEach((mod) => {
        if (mod.required && mod.options.length > 0) {
          initial[mod.name] = {
            optionName: mod.options[0].name,
            price: mod.options[0].price,
          };
        }
      });
      setSelectedModifiers(initial);
    }
  }, [product]);

  const handleSelectOption = (modName: string, optionName: string, price: number) => {
    setSelectedModifiers((prev) => ({
      ...prev,
      [modName]: { optionName, price },
    }));
  };

  const modifiersTotal = Object.values(selectedModifiers).reduce(
    (acc, cur) => acc + cur.price,
    0
  );
  const unitPrice = product.price + modifiersTotal;
  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
    const formattedMods = Object.entries(selectedModifiers).map(([modName, val]) => ({
      modifierName: modName,
      optionName: val.optionName,
      price: val.price,
    }));
    onAddToCart(product, quantity, formattedMods, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/40 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-warm-card rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[90vh] flex flex-col border border-warm-border shadow-warmLg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-64 w-full bg-stone-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-white/80 hover:bg-white text-stone-800 transition-colors backdrop-blur-md shadow-md"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {product.prepTimeMinutes && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs backdrop-blur-md font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                {product.prepTimeMinutes} دقيقة
              </span>
            )}
            {product.calories && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs backdrop-blur-md font-semibold">
                <Flame className="w-3.5 h-3.5 text-rose-300" />
                {product.calories} كالوري
              </span>
            )}
          </div>

          <div className="absolute bottom-4 right-4 left-4">
            <h3 className="text-xl font-black text-white">{product.name}</h3>
            <p className="text-sm font-extrabold text-amber-300 mt-0.5">
              {product.price} {currency}
            </p>
          </div>
        </div>

        {/* Modal Body / Modifiers */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 bg-warm-card">
          <p className="text-xs text-warm-muted leading-relaxed">
            {product.description}
          </p>

          {/* Modifiers List */}
          {product.modifiers && product.modifiers.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-warm-border">
              {product.modifiers.map((mod) => (
                <div key={mod.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-warm-text">
                      {mod.name}
                    </span>
                    {mod.required ? (
                      <span className="text-[10px] text-amber-800 font-semibold bg-amber-100/70 px-2 py-0.5 rounded-full border border-amber-200">
                        إلزامي
                      </span>
                    ) : (
                      <span className="text-[10px] text-warm-muted font-medium">
                        اختياري
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {mod.options.map((opt) => {
                      const isSelected =
                        selectedModifiers[mod.name]?.optionName === opt.name;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            handleSelectOption(mod.name, opt.name, opt.price)
                          }
                          className={`flex items-center justify-between p-3 rounded-2xl border text-xs transition-all ${
                            isSelected
                              ? "bg-amber-50/80 border-amber-400 text-stone-900 font-bold shadow-sm"
                              : "bg-warm-surface/60 border-warm-border text-warm-text hover:bg-warm-surface"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                                isSelected
                                  ? "border-amber-600 bg-amber-600 text-white"
                                  : "border-stone-400"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span>{opt.name}</span>
                          </div>
                          {opt.price > 0 && (
                            <span className="text-amber-700 font-bold">
                              +{opt.price} {currency}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notes Input */}
          <div className="space-y-2 pt-2 border-t border-warm-border">
            <label className="text-xs font-bold text-warm-text block">
              ملاحظات خاصة للشيف:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: بدون بصل، زيادة صوص، ليمون إضافي..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-warm-surface border border-warm-border text-xs text-warm-text placeholder-stone-400 focus:outline-none focus:border-warm-accent"
            />
          </div>
        </div>

        {/* Modal Footer / Add Button */}
        <div className="p-4 bg-warm-surface border-t border-warm-border flex items-center justify-between gap-4">
          {/* Quantity Controls */}
          <div className="flex items-center gap-3 bg-white border border-warm-border rounded-2xl px-2 py-1.5 shadow-sm">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-1.5 rounded-xl bg-warm-surface hover:bg-stone-200 text-stone-700 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-extrabold text-sm text-warm-text w-5 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-1.5 rounded-xl bg-warm-surface hover:bg-stone-200 text-stone-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-between px-5 py-3 rounded-2xl text-white font-bold text-xs shadow-warm transition-transform active:scale-98"
            style={{ backgroundColor: primaryColor || "#D97706" }}
          >
            <span>إضافة إلى الطلب</span>
            <span className="font-black">
              {totalPrice} {currency}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
