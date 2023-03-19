"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ArrowRight } from "./Icons";

export default function Navigation() {
  return (
    <div>
      <div className="bg-red-100 w-fit">
        <ArrowRight />
        <ArrowRight />
        <ArrowRight />
      </div>
    </div>
  );
}
