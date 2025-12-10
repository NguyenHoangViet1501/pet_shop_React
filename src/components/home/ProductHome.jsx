import React from 'react';
import ProductCard from '../product/ProductCard';

const ProductHome = ({ title, products }) => {
  return (
    <section className="py-5 bg-white">
      <div className="container">
        <div className="position-relative mb-5">
            <h2 className="fw-bold text-center mb-0">{title}</h2>
            <div className="position-absolute top-50 end-0 translate-middle-y d-none d-md-flex gap-2">
                <button className="btn btn-dark rounded-circle p-0 d-flex align-items-center justify-content-center" style={{width: 36, height: 36}}>
                    <i className="fas fa-chevron-left"></i>
                </button>
                <button className="btn btn-dark rounded-circle p-0 d-flex align-items-center justify-content-center" style={{width: 36, height: 36}}>
                    <i className="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
        
        <div className="row g-4">
          {products && products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="col-lg-3 col-md-6">
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            <div className="col-12 text-center text-muted">
              Không có sản phẩm nào.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductHome;
