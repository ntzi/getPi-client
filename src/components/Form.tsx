import { FC, useState, useEffect } from 'react';
import { RotatingLines } from 'react-loader-spinner';
const API_HOST = import.meta.env.VITE_API_HOST;

export const Form: FC = () => {
	const [total, setTotal] = useState<number>(0);
	const [points, setPoints] = useState<{x:number, y:number}[]>([]);
	const [pi, setPi] = useState<number>(0);
	const [warning, setWarning] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	const updateTotal = (event: any) => {
		setTotal(Number(event.target.value));
	};

	const isPositiveInt = (total: any) => {
		const isPositive = total > 0;
		const isInt = Number.isInteger(total);
		const isPositiveInt = isPositive && isInt;
		return isPositiveInt;
	};

	useEffect(() => {
		if (!isPositiveInt(total)) {
			setWarning(true);
			return;
		}
		const controller = new AbortController();

		setWarning(false);

		const generatePoints = async () => {
			setLoading(true);

			try {
				let response = await fetch(
					`${API_HOST}/api/point?total=${total}`,
					{
						signal: controller.signal,
					},
				);
				if (response.status >= 400) {
					setLoading(false);
					setWarning(true);
					setPi(0);
					return;
				}
				const points = await response.json();
				setPoints(points);
				setLoading(false);
			} catch (err: any) {
				setLoading(false);
				setWarning(true);
				setPi(0);
				throw err;
			}
		};

		generatePoints();

		return () => {
			controller.abort();
		};
	}, [total]);

	useEffect(() => {
		calculatePi();
	}, [points]);

	const loadingAnimation = () => {
		return (
			<RotatingLines
				strokeColor="grey"
				strokeWidth="3"
				animationDuration="0.75"
				width="40"
				visible={true}
			/>
		);
	};

	const calculatePi = async () => {
		const r = 1;
		var points_inside = 0;
		let pi = 0;
		setLoading(true);

		await Promise.all([
			points.map((point) => {
				const x = point.x * r * 2 - r;
				const y = point.y * r * 2 - r;

				if (Math.pow(x, 2) + Math.pow(y, 2) < Math.pow(r, 2))
					points_inside++;

				pi = (4 * points_inside) / total;
			}),
		]);

		setPi(pi);
		setLoading(false);
	};

	return (
		<div className="form">
			<h1>Get Pi using Monte Carlo method</h1>
			<h2>Provide the total number of points</h2>
			<div></div>
			<input
				type="text"
				placeholder="Total Points"
				className="form--input"
				name="total"
				onChange={updateTotal}
			/>
			<h2>{loading ? loadingAnimation() : `π = ${pi}`}</h2>
			{warning && (
				<p>Please provide a positive integer less than 10,000,000</p>
			)}
		</div>
	);
};
