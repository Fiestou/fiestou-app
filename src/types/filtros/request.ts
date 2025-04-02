import React from "react";

export interface RequestRegister {
  name: string
  description: string
  isFather: boolean
  parent_id?: number
}

const RequestTypesPage: React.FC = () => {
  return (
    <div>
      <h1>Request Types</h1>
    </div>
  );
};

export default RequestTypesPage;