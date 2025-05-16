import React from "react";

export interface RequestRegister {
  name: string
  description: string
  active: boolean
  segment?: boolean
}

const RequestTypesPage: React.FC = () => {
  return (
    <div>
      <h1>Request Types</h1>
    </div>
  );
};

export default RequestTypesPage;